"use client";

/**
 * AboutHeroNetwork — React Three Fiber implementation
 *
 * A breathing network of nodes for the About hero. WebGL-rendered so:
 *   - cursor pull is smooth (lerped per-frame, no DOM mutation)
 *   - connection lines are drawn progressively via a fragment shader that
 *     discards pixels past a `uProgress` uniform tweened by GSAP
 *   - dissolves are GSAP-driven opacity fades on the same uniform set
 *   - palette resolves from design-system CSS variables at runtime and
 *     re-resolves when the [data-theme] attribute on <html> changes
 *
 * Design goals carried over: significant negative space (16 nodes, max 6
 * active edges), restrained motion, asymmetric placement, three "anchor"
 * nodes carry accent / violet / magenta tokens.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/motion";

// ---------- domain types ------------------------------------------------

type Hue = "ink" | "accent" | "violet" | "magenta";

type NodeDef = {
  readonly id: number;
  /** World position X — coordinate system is centered at 0, range −50…50. */
  readonly x: number;
  /** World position Y — Three.js Y is up, so visually higher = larger Y. */
  readonly y: number;
  /** Visible radius in world units. */
  readonly size: number;
  readonly hue: Hue;
  /** Drift frequency (radians/sec roughly). Each node gets a unique value
   *  so the field never falls into a single shared rhythm. */
  readonly freq: number;
  readonly phase: number;
};

type Connection = {
  id: number;
  from: number;
  to: number;
  dissolving?: boolean;
};

// ---------- nodes -------------------------------------------------------
// Hand-placed positions. Asymmetric clusters with deliberate empty patches
// near (0, 25) and (-15, -15) to preserve breathing room.

const NODES: readonly NodeDef[] = [
  { id: 0,  x: -28, y:  32, size: 1.4, hue: "ink",    freq: 0.42, phase: 0.0 },
  { id: 1,  x:  28, y:  36, size: 2.2, hue: "accent", freq: 0.31, phase: 1.2 },
  { id: 2,  x:  -4, y:  20, size: 1.6, hue: "ink",    freq: 0.55, phase: 2.4 },
  { id: 3,  x:  38, y:  12, size: 1.2, hue: "ink",    freq: 0.48, phase: 3.5 },
  { id: 4,  x: -38, y:   2, size: 1.8, hue: "violet", freq: 0.36, phase: 4.6 },
  { id: 5,  x:  12, y:   0, size: 1.0, hue: "ink",    freq: 0.62, phase: 5.7 },
  { id: 6,  x: -20, y: -14, size: 2.4, hue: "accent", freq: 0.28, phase: 0.6 },
  { id: 7,  x:  32, y: -18, size: 1.4, hue: "magenta", freq: 0.45, phase: 1.7 },
  { id: 8,  x:   0, y: -28, size: 1.6, hue: "ink",    freq: 0.51, phase: 2.8 },
  { id: 9,  x: -32, y: -32, size: 1.0, hue: "ink",    freq: 0.58, phase: 3.9 },
  { id: 10, x:  22, y: -38, size: 1.6, hue: "ink",    freq: 0.34, phase: 5.0 },
  { id: 11, x:   6, y:  39, size: 1.0, hue: "ink",    freq: 0.66, phase: 6.1 },
  { id: 12, x: -12, y:   4, size: 1.2, hue: "ink",    freq: 0.40, phase: 0.9 },
  { id: 13, x: -42, y:  24, size: 1.0, hue: "ink",    freq: 0.50, phase: 2.1 },
  { id: 14, x:  44, y:  -6, size: 1.0, hue: "ink",    freq: 0.44, phase: 3.3 },
  { id: 15, x:  -8, y: -42, size: 1.0, hue: "ink",    freq: 0.38, phase: 4.5 },
] as const;

const MAX_ACTIVE_CONNECTIONS = 8;
/** Wait until nodes have finished their pop-in entrance before the first edge fires. */
const INITIAL_DELAY_MS = 1100;
/** During the opening burst, ticks fire fast so several edges appear quickly. */
const BURST_INTERVAL_MS = 220;
const BURST_TARGET_EDGES = 6;
/** Per-node entry: random pop-in within this window after mount. */
const NODE_ENTRY_WINDOW_MS = 800;
const NODE_ENTRY_DURATION_MS = 360;
/** Once the network is "warmed up", ticks slow to a steady, calm pace. */
const SCHEDULE_MIN_MS = 850;
const SCHEDULE_MAX_MS = 1900;
const DISSOLVE_MS = 600;
const DRAW_MS = 750;
const DRIFT_AMPLITUDE = 1.6;
const CURSOR_RADIUS = 22;
const CURSOR_PULL_MAX = 3.4;
const HOVER_RADIUS = 7;
// World-unit width of each connection ribbon. Drawn as a thin filled quad
// rather than a 1px WebGL line so edges stay visible in both themes.
const LINE_THICKNESS = 0.5;

// ---------- shaders -----------------------------------------------------

/**
 * Node shader.
 * Plane geometry sized 2× the visible radius. The shader paints a hard-ish
 * bright core then falls off into a soft halo, all within the plane. This
 * means every node gets a consistent glow without us having to layer
 * additional meshes.
 */
const NODE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NODE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;     // 0..1, hover brightens
  uniform float uCoreRadius;    // 0..0.5
  uniform float uHaloFalloff;   // larger = softer
  uniform float uHaloMix;       // halo contribution; 0 disables the bloom

  varying vec2 vUv;

  void main() {
    vec2 centered = vUv - 0.5;
    float dist = length(centered) * 2.0;       // 0 at center, 1 at edge
    float core = 1.0 - smoothstep(uCoreRadius * 0.55, uCoreRadius, dist);
    float halo = 1.0 - smoothstep(uCoreRadius, uHaloFalloff, dist);
    float alpha = clamp(core + halo * uHaloMix, 0.0, 1.0) * uIntensity;
    if (alpha < 0.001) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

/**
 * Line shader.
 * BufferGeometry has two vertices, each tagged with a lineT attribute (0 at
 * the start vertex, 1 at the end). The fragment shader discards pixels past
 * uProgress, with a small smoothstep on the leading edge so the line head
 * has a soft brush feel. Dissolves fade the whole line via uOpacity.
 */
const LINE_VERT = /* glsl */ `
  attribute float lineT;
  varying float vT;
  void main() {
    vT = lineT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LINE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uProgress;
  uniform float uEmphasis;   // hover boost
  varying float vT;

  void main() {
    if (vT > uProgress) discard;
    // Soft head — a thin highlight band right at the drawing edge.
    float headBand = 1.0 - smoothstep(uProgress - 0.10, uProgress, vT);
    float alpha = uOpacity * (0.85 + headBand * 0.15) * (1.0 + uEmphasis * 0.6);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// ---------- runtime palette -------------------------------------------

function readPalette(): Record<Hue, THREE.Color> {
  const styles = getComputedStyle(document.documentElement);
  const read = (token: string, fallback: string) => {
    const v = styles.getPropertyValue(token).trim();
    return new THREE.Color(v || fallback);
  };
  return {
    ink: read("--color-ink-dim", "#a3a3ad"),
    accent: read("--color-accent", "#e89348"),
    violet: read("--color-violet", "#5b2db5"),
    magenta: read("--color-magenta", "#c2186a"),
  };
}

// ---------- shared per-frame state -------------------------------------

type NetworkState = {
  /** Current rendered position per node (world coords). */
  positions: THREE.Vector3[];
  /** Cursor position in world coords. (0,0,0) is center; off-canvas = (1e6, 1e6, 0). */
  cursor: THREE.Vector3;
  /** Whether cursor is currently over the canvas. */
  cursorActive: boolean;
  /** Time started, used for stable absolute-time drift. */
  startedAt: number;
  /** Palette resolved from CSS vars; updated when theme changes. */
  palette: Record<Hue, THREE.Color>;
  /** prefers-reduced-motion — skip drift + cursor pull when true. */
  reduced: boolean;
  /** Mirrors [data-theme="light"]; consumed by Scene to zero halo blooms. */
  lightTheme: boolean;
};

// ---------- node mesh --------------------------------------------------

function Node({
  node,
  state,
}: {
  node: NodeDef;
  state: NetworkState;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uColor: { value: state.palette[node.hue].clone() },
      // Starts invisible — GSAP pops it in with a random per-node delay
      // so the field reads as nodes appearing one by one, not as a grid.
      uIntensity: { value: 0 },
      uCoreRadius: { value: 0.24 },
      uHaloFalloff: { value: 0.95 },
      // Halo bloom contribution. 0.32 in dark, 0 in light — the bloom on a
      // cream bg reads as a dim smudge, not a glow.
      uHaloMix: { value: 0.32 },
    }),
    // We resolve palette colors on mount; theme-flip handler in Scene
    // updates uniforms imperatively, so no need to re-create them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Compute a per-node random entry offset once, so the same node always
  // pops at the same time across re-renders.
  const entryDelay = useMemo(
    () => (Math.random() * NODE_ENTRY_WINDOW_MS) / 1000,
    []
  );

  // While false, the per-frame hover lerp leaves uIntensity alone so GSAP
  // owns the entry animation. Once GSAP finishes, useFrame takes over.
  const entryDoneRef = useRef(false);

  // GSAP entry — pop-in via uIntensity tween. Slight overshoot on the ease
  // so the node looks like it's snapping into existence.
  useEffect(() => {
    if (!matRef.current) return;
    if (state.reduced) {
      matRef.current.uniforms.uIntensity.value = 1.05;
      entryDoneRef.current = true;
      return;
    }
    const tween = gsap.fromTo(
      matRef.current.uniforms.uIntensity,
      { value: 0 },
      {
        value: 1.05,
        duration: NODE_ENTRY_DURATION_MS / 1000,
        ease: "back.out(2)",
        delay: entryDelay,
        onComplete: () => {
          entryDoneRef.current = true;
        },
      }
    );
    return () => {
      tween.kill();
    };
  }, [entryDelay, state.reduced]);

  // Plane width = 4× the node's visible radius — gives the halo room.
  const planeSize = node.size * 5;

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    // Drift via two sine waves of different periods so nodes never sync.
    const t = (performance.now() - state.startedAt) / 1000;
    const driftX = state.reduced
      ? 0
      : Math.sin(t * node.freq + node.phase) * DRIFT_AMPLITUDE;
    const driftY = state.reduced
      ? 0
      : Math.cos(t * node.freq * 0.7 + node.phase * 1.3) * DRIFT_AMPLITUDE;

    // Cursor pull — only while the pointer is inside the canvas.
    let pullX = 0;
    let pullY = 0;
    if (state.cursorActive && !state.reduced) {
      const dx = state.cursor.x - node.x;
      const dy = state.cursor.y - node.y;
      const dist = Math.hypot(dx, dy);
      if (dist < CURSOR_RADIUS && dist > 0.01) {
        const force =
          ((CURSOR_RADIUS - dist) / CURSOR_RADIUS) * CURSOR_PULL_MAX;
        pullX = (dx / dist) * force;
        pullY = (dy / dist) * force;
      }
    }

    const targetX = node.x + driftX + pullX;
    const targetY = node.y + driftY + pullY;

    // Lerp toward target so cursor flicks don't snap the node — this kills
    // the jitter the previous SVG implementation had.
    const lerp = Math.min(1, delta * 6);
    mesh.position.x += (targetX - mesh.position.x) * lerp;
    mesh.position.y += (targetY - mesh.position.y) * lerp;

    // Publish current position back to shared state for the lines to read.
    state.positions[node.id].set(mesh.position.x, mesh.position.y, 0);

    // Hover intensity — bright when cursor is near. Skip while the GSAP
    // entry tween is still running so it doesn't fight the pop-in.
    if (entryDoneRef.current) {
      let nearTarget = 1.05;
      if (state.cursorActive) {
        const d = Math.hypot(
          state.cursor.x - mesh.position.x,
          state.cursor.y - mesh.position.y
        );
        if (d < HOVER_RADIUS) {
          nearTarget = 1.4 + (1 - d / HOVER_RADIUS) * 0.5;
        }
      }
      const curr = mat.uniforms.uIntensity.value as number;
      mat.uniforms.uIntensity.value = curr + (nearTarget - curr) * lerp;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[node.x, node.y, 0]}
      // Mark with a userData key so the parent can find it for theme updates.
      userData={{ networkNode: node.id, hue: node.hue }}
    >
      <planeGeometry args={[planeSize, planeSize]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={NODE_VERT}
        fragmentShader={NODE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// ---------- connection line --------------------------------------------

function ConnectionLine({
  conn,
  state,
  onDissolved,
}: {
  conn: Connection;
  state: NetworkState;
  onDissolved: (id: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // Geometry — a 4-vertex quad (thin ribbon) + a lineT attribute. Vertices:
  //   0 = from +perp   1 = from -perp   2 = to +perp   3 = to -perp
  // lineT runs 0 at the "from" end → 1 at the "to" end, so the progressive
  // draw shader (discard vT > uProgress) still reveals it end-to-end.
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(12), 3)
    );
    g.setAttribute(
      "lineT",
      new THREE.BufferAttribute(new Float32Array([0, 0, 1, 1]), 1)
    );
    g.setIndex([0, 1, 2, 2, 1, 3]);
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uColor: { value: state.palette.ink.clone() },
      uOpacity: { value: 0.8 },
      uProgress: { value: 0 },
      uEmphasis: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Draw-in animation on mount, using GSAP for the smooth ease and to give
  // every line a consistent feel regardless of length.
  useEffect(() => {
    if (!matRef.current) return;
    if (state.reduced) {
      matRef.current.uniforms.uProgress.value = 1;
      return;
    }
    const tween = gsap.fromTo(
      matRef.current.uniforms.uProgress,
      { value: 0 },
      { value: 1, duration: DRAW_MS / 1000, ease: "power3.out" }
    );
    return () => {
      tween.kill();
    };
  }, [state.reduced]);

  // Dissolve animation. When the parent flips `conn.dissolving = true`,
  // we fade the uniform opacity then notify the parent so it can splice
  // this connection out of state.
  useEffect(() => {
    if (!conn.dissolving || !matRef.current) return;
    const tween = gsap.to(matRef.current.uniforms.uOpacity, {
      value: 0,
      duration: DISSOLVE_MS / 1000,
      ease: "power2.in",
      onComplete: () => onDissolved(conn.id),
    });
    return () => {
      tween.kill();
    };
  }, [conn.dissolving, conn.id, onDissolved]);

  // Update endpoint positions every frame to follow drifting nodes.
  useFrame(() => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    const from = state.positions[conn.from];
    const to = state.positions[conn.to];
    // Unit perpendicular to the segment, scaled to half the ribbon width.
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const px = (-dy / len) * (LINE_THICKNESS / 2);
    const py = (dx / len) * (LINE_THICKNESS / 2);
    const arr = (mesh.geometry.attributes.position as THREE.BufferAttribute)
      .array as Float32Array;
    arr[0] = from.x + px; // 0: from +perp
    arr[1] = from.y + py;
    arr[2] = 0;
    arr[3] = from.x - px; // 1: from -perp
    arr[4] = from.y - py;
    arr[5] = 0;
    arr[6] = to.x + px; // 2: to +perp
    arr[7] = to.y + py;
    arr[8] = 0;
    arr[9] = to.x - px; // 3: to -perp
    arr[10] = to.y - py;
    arr[11] = 0;
    (mesh.geometry.attributes.position as THREE.BufferAttribute).needsUpdate =
      true;

    // Hover emphasis: if the cursor is near either endpoint, boost.
    let emphasisTarget = 0;
    if (state.cursorActive) {
      const dFrom = Math.hypot(
        state.cursor.x - from.x,
        state.cursor.y - from.y
      );
      const dTo = Math.hypot(state.cursor.x - to.x, state.cursor.y - to.y);
      if (Math.min(dFrom, dTo) < HOVER_RADIUS) emphasisTarget = 1;
    }
    const curr = mat.uniforms.uEmphasis.value as number;
    mat.uniforms.uEmphasis.value = curr + (emphasisTarget - curr) * 0.12;

    // Switch line color when emphasized — gold accent on hover.
    if (emphasisTarget > 0.5) {
      mat.uniforms.uColor.value.copy(state.palette.accent);
    } else if (emphasisTarget < 0.05) {
      mat.uniforms.uColor.value.copy(state.palette.ink);
    }
  });

  // Thin ribbon quad (mesh) rather than a 1px <line> so the edge has a
  // visible, theme-independent stroke width. frustumCulled off because the
  // bounding sphere is computed from the initial (zeroed) vertices.
  return (
    <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={LINE_VERT}
        fragmentShader={LINE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------- pointer plane -----------------------------------------------
// A transparent plane fills the camera view and captures pointer moves to
// translate them into world coordinates that nodes can read.

function PointerPlane({ state }: { state: NetworkState }) {
  const handleMove = useCallback(
    (e: { point: THREE.Vector3 }) => {
      state.cursor.copy(e.point);
      state.cursorActive = true;
    },
    [state]
  );
  const handleLeave = useCallback(() => {
    state.cursor.set(1e6, 1e6, 0);
    state.cursorActive = false;
  }, [state]);

  return (
    <mesh
      position={[0, 0, -1]}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

// ---------- camera setup ------------------------------------------------

function CameraSetup() {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    const aspect = size.width / size.height || 1;
    // Fit the larger of width / height so the −50…50 box is always inside view.
    if (aspect >= 1) {
      camera.top = 50;
      camera.bottom = -50;
      camera.left = -50 * aspect;
      camera.right = 50 * aspect;
    } else {
      camera.left = -50;
      camera.right = 50;
      camera.top = 50 / aspect;
      camera.bottom = -50 / aspect;
    }
    camera.position.set(0, 0, 10);
    camera.zoom = 1;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

// ---------- scene root --------------------------------------------------

function Scene({
  connections,
  onDissolved,
  state,
  paletteRev,
}: {
  connections: Connection[];
  onDissolved: (id: number) => void;
  state: NetworkState;
  /** Bumped when CSS palette changes so we re-render uniforms. */
  paletteRev: number;
}) {
  const { scene } = useThree();

  // When palette changes, walk the scene and update every shader material's
  // uColor uniform. Also zero the node halos in light theme so the dot field
  // stays sharp on cream instead of reading as dim smudges.
  useEffect(() => {
    const haloMix = state.lightTheme ? 0 : 0.32;
    scene.traverse((obj) => {
      if (
        (obj as THREE.Mesh).isMesh &&
        (obj as THREE.Mesh).material instanceof THREE.ShaderMaterial
      ) {
        const mat = (obj as THREE.Mesh).material as THREE.ShaderMaterial;
        const hue = (obj.userData?.hue as Hue | undefined) ?? "ink";
        if (mat.uniforms.uColor && state.palette[hue]) {
          mat.uniforms.uColor.value.copy(state.palette[hue]);
        }
        if (mat.uniforms.uHaloMix) {
          mat.uniforms.uHaloMix.value = haloMix;
        }
      }
    });
    // Lines update their own color reactively via emphasis; the palette
    // reference inside `state.palette` is what they read on next frame.
  }, [paletteRev, scene, state.palette, state.lightTheme]);

  return (
    <>
      <CameraSetup />
      <PointerPlane state={state} />
      {NODES.map((node) => (
        <Node key={node.id} node={node} state={state} />
      ))}
      {connections.map((conn) => (
        <ConnectionLine
          key={conn.id}
          conn={conn}
          state={state}
          onDissolved={onDissolved}
        />
      ))}
    </>
  );
}

// ---------- public component --------------------------------------------

export function AboutHeroNetwork({ className = "" }: { className?: string }) {
  const reduced =
    typeof window === "undefined" ? false : prefersReducedMotion();

  // One shared mutable bag, passed down by ref-identity so children don't
  // need to re-render when its internals change.
  const stateRef = useRef<NetworkState>({
    positions: NODES.map((n) => new THREE.Vector3(n.x, n.y, 0)),
    cursor: new THREE.Vector3(1e6, 1e6, 0),
    cursorActive: false,
    startedAt: typeof performance !== "undefined" ? performance.now() : 0,
    palette: {
      ink: new THREE.Color("#a3a3ad"),
      accent: new THREE.Color("#e89348"),
      violet: new THREE.Color("#5b2db5"),
      magenta: new THREE.Color("#c2186a"),
    },
    reduced,
    lightTheme: false,
  });
  const [paletteRev, setPaletteRev] = useState(0);

  // Resolve real CSS-variable colors on mount and whenever [data-theme]
  // flips on <html>. Mutating in place keeps Node / Line shader uniforms
  // referencing the same THREE.Color, so they pick up the new values on
  // the next frame without anything re-creating uniforms.
  useEffect(() => {
    const apply = () => {
      const fresh = readPalette();
      (Object.keys(fresh) as Hue[]).forEach((hue) => {
        stateRef.current.palette[hue].copy(fresh[hue]);
      });
      stateRef.current.lightTheme =
        document.documentElement.getAttribute("data-theme") === "light";
      setPaletteRev((n) => n + 1);
    };
    apply();
    const obs = new MutationObserver(apply);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);

  // Connections — React state, updated by the scheduler.
  const [connections, setConnections] = useState<Connection[]>([]);

  const handleDissolved = useCallback((id: number) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Scheduler — adds + dissolves edges on a randomized cadence.
  useEffect(() => {
    if (reduced) {
      setConnections([
        { id: 1, from: 1, to: 5 },
        { id: 2, from: 6, to: 12 },
        { id: 3, from: 4, to: 9 },
      ]);
      return;
    }

    let nextId = 1;
    let scheduleTimer: ReturnType<typeof setTimeout> | null = null;

    function pickPair(existing: Connection[]): [number, number] | null {
      for (let attempt = 0; attempt < 16; attempt++) {
        const from = Math.floor(Math.random() * NODES.length);
        const to = Math.floor(Math.random() * NODES.length);
        if (from === to) continue;
        const overlap = existing.some(
          (c) =>
            !c.dissolving &&
            ((c.from === from && c.to === to) ||
              (c.from === to && c.to === from))
        );
        if (overlap) continue;
        return [from, to];
      }
      return null;
    }

    /**
     * Two phases:
     *  1. Burst — fire ticks every BURST_INTERVAL_MS until the network has
     *     BURST_TARGET_EDGES active edges. Only adds, never dissolves, so
     *     the page populates quickly when the user lands.
     *  2. Steady — random 850–1900ms intervals, both adds + occasional
     *     dissolves. Network feels alive but calm.
     */
    let inBurst = true;

    function tick() {
      let didMutate = false;

      setConnections((prev) => {
        const active = prev.filter((c) => !c.dissolving);

        // Burst phase — keep adding until we hit the target count.
        if (inBurst) {
          if (active.length >= BURST_TARGET_EDGES) {
            inBurst = false;
          } else {
            const pair = pickPair(prev);
            if (pair) {
              didMutate = true;
              return [
                ...prev,
                { id: nextId++, from: pair[0], to: pair[1] },
              ];
            }
          }
        }

        // Steady phase — 30% chance to dissolve an old edge first.
        if (active.length > 3 && Math.random() < 0.3) {
          const oldest = active[0];
          didMutate = true;
          return prev.map((c) =>
            c.id === oldest.id ? { ...c, dissolving: true } : c
          );
        }

        if (active.length < MAX_ACTIVE_CONNECTIONS) {
          const pair = pickPair(prev);
          if (pair) {
            didMutate = true;
            return [...prev, { id: nextId++, from: pair[0], to: pair[1] }];
          }
        }

        return prev;
      });

      // Schedule next tick. Burst phase uses a fixed short interval, steady
      // phase uses a randomized longer one.
      const delay = inBurst
        ? BURST_INTERVAL_MS
        : SCHEDULE_MIN_MS +
          Math.random() * (SCHEDULE_MAX_MS - SCHEDULE_MIN_MS);
      // Avoid lint noise about unused locals if React re-runs us.
      void didMutate;
      scheduleTimer = setTimeout(tick, delay);
    }

    const initial = setTimeout(tick, INITIAL_DELAY_MS);
    return () => {
      clearTimeout(initial);
      if (scheduleTimer) clearTimeout(scheduleTimer);
    };
  }, [reduced]);

  return (
    <div className={`relative ${className}`}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 1, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
        style={{ background: "transparent" }}
      >
        <Scene
          connections={connections}
          onDissolved={handleDissolved}
          state={stateRef.current}
          paletteRev={paletteRev}
        />
      </Canvas>
    </div>
  );
}
