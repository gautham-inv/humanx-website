"use client";

/**
 * ServicesHeroSolarSystem
 * -----------------------
 * Flat "atom rosette" for the Services hero — a React-logo-style symbol.
 * 1 nucleus + 6 eccentric elliptical orbits sharing a common center, each
 * rotated in-plane by 30° (i × 180°/6) so they fan out into a symmetric
 * rosette. One electron rides each orbit, evenly phase-offset so they form a
 * balanced 6-point pattern, all revolving at one calm shared speed.
 *
 * Built to match the AboutHeroNetwork's complexity profile and to keep the
 * existing visual language intact:
 *   - React Three Fiber, single Canvas, orthographic (front-on) camera
 *   - Plane-meshes with a soft-circle fragment shader for nucleus + electrons
 *   - LineLoop with a shader for each elliptical orbit (rotated about z)
 *   - GSAP staggers entry (electrons pop in first, then orbits fan out)
 *   - Cursor near an electron brightens it AND its orbit
 *   - Colors resolve from --color-* tokens so the visual flips with theme
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/motion";

// ─── types & data ────────────────────────────────────────────────────────

type Hue = "ink" | "accent" | "violet" | "magenta";

type OrbitDef = {
  readonly id: number;
  /** In-plane rotation of this ellipse (radians) — i × 30°. */
  readonly rotation: number;
  /** Initial angular position of the electron on its ellipse. */
  readonly phase: number;
  readonly hue: Hue;
};

const ORBIT_COUNT = 6;
const ELLIPSE_A = 38; // semi-major axis (world units)
const ELLIPSE_B = 13; // semi-minor axis — eccentric, React-logo-ish
const ELECTRON_SPEED = 0.18; // rad/sec — one shared speed keeps it symmetric
const ELECTRON_SIZE = 1.4;
const NUCLEUS_SIZE = 2.8;
const ORBIT_SEGMENTS = 128;
const HOVER_RADIUS = 6; // world units within which the cursor brightens an electron
const CURSOR_DRIFT_RADIUS = 14; // world units within which the cursor nudges electrons

// Electron colours cycle through the vivid tokens; orbit lines stay ink-dim.
const ELECTRON_HUES: readonly Hue[] = [
  "accent",
  "violet",
  "magenta",
  "accent",
  "violet",
  "magenta",
];

const ORBITS: readonly OrbitDef[] = Array.from(
  { length: ORBIT_COUNT },
  (_, i): OrbitDef => ({
    id: i,
    rotation: (i * Math.PI) / ORBIT_COUNT, // 30° steps → spans the full rosette
    phase: (i * Math.PI * 2) / ORBIT_COUNT, // evenly spread the electrons
    hue: ELECTRON_HUES[i % ELECTRON_HUES.length],
  })
);

/** Rotate a local ellipse point (lx, ly) into world space by `rot`. */
function rotatePoint(lx: number, ly: number, rot: number): [number, number] {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return [lx * c - ly * s, lx * s + ly * c];
}

// ─── shaders ─────────────────────────────────────────────────────────────

// Soft-circle body shader — same family as AboutHeroNetwork's node shader.
const BODY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BODY_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uCoreRadius;
  uniform float uHaloFalloff;
  uniform float uHaloMix;

  varying vec2 vUv;

  void main() {
    vec2 centered = vUv - 0.5;
    float dist = length(centered) * 2.0;
    float core = 1.0 - smoothstep(uCoreRadius * 0.55, uCoreRadius, dist);
    float halo = 1.0 - smoothstep(uCoreRadius, uHaloFalloff, dist);
    float alpha = clamp(core + halo * uHaloMix, 0.0, 1.0) * uIntensity;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// Orbit-line shader. Flat colour, modulated by a hover emphasis uniform.
const ORBIT_VERT = /* glsl */ `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ORBIT_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uEmphasis;

  void main() {
    // Same baseline treatment as the AboutHeroNetwork edges: ink-dim color
    // at ~0.68 alpha when at rest, gets brighter under cursor influence.
    float alpha = uOpacity * (0.85 + uEmphasis * 0.5);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// ─── runtime palette ─────────────────────────────────────────────────────

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

// ─── shared state ────────────────────────────────────────────────────────

type SharedState = {
  cursor: THREE.Vector3;
  cursorActive: boolean;
  palette: Record<Hue, THREE.Color>;
  reduced: boolean;
  /** Mirrors [data-theme="light"]; zeroes halo blooms on cream bg. */
  lightTheme: boolean;
};

// ─── camera setup ────────────────────────────────────────────────────────

function CameraSetup() {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    const aspect = size.width / Math.max(1, size.height);
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

// ─── nucleus ───────────────────────────────────────────────────────────────

function Nucleus({ state }: { state: SharedState }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uColor: { value: state.palette.accent.clone() },
      uIntensity: { value: 1.2 },
      uCoreRadius: { value: 0.26 },
      uHaloFalloff: { value: 1.0 },
      uHaloMix: { value: 0.34 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Soft heartbeat — nucleus breathes very subtly so it doesn't feel inert.
  useFrame(({ clock }) => {
    const mat = matRef.current;
    if (!mat) return;
    mat.uniforms.uColor.value.copy(state.palette.accent);
    mat.uniforms.uHaloMix.value = state.lightTheme ? 0 : 0.34;
    if (state.reduced) {
      mat.uniforms.uIntensity.value = 1.2;
      return;
    }
    const pulse = 1.15 + Math.sin(clock.elapsedTime * 0.6) * 0.08;
    mat.uniforms.uIntensity.value = pulse;
  });

  return (
    <mesh position={[0, 0, 0]} renderOrder={1}>
      <planeGeometry args={[NUCLEUS_SIZE * 5, NUCLEUS_SIZE * 5]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={BODY_VERT}
        fragmentShader={BODY_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── orbit line ──────────────────────────────────────────────────────────

function OrbitLine({
  geometry,
  rotation,
  state,
  emphasisRef,
  index,
}: {
  geometry: THREE.BufferGeometry;
  rotation: number;
  state: SharedState;
  /** Per-electron emphasis level (0..1) that this orbit mirrors. */
  emphasisRef: { current: number };
  /** Index of this orbit — drives the entry stagger. */
  index: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uColor: { value: state.palette.ink.clone() },
      uOpacity: { value: 0.0 }, // tweened in by GSAP on mount
      uEmphasis: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // GSAP entry — orbits fan out AFTER the electrons have popped in, staggered
  // by index so the rosette unfurls petal by petal.
  useEffect(() => {
    if (!matRef.current) return;
    // Match the AboutHeroNetwork edge baseline opacity so the visual
    // language is consistent across the two heroes.
    const targetOpacity = 0.8;
    if (state.reduced) {
      matRef.current.uniforms.uOpacity.value = targetOpacity;
      return;
    }
    const tween = gsap.to(matRef.current.uniforms.uOpacity, {
      value: targetOpacity,
      duration: 1.0,
      ease: "power2.out",
      delay: 1.2 + index * 0.08,
    });
    return () => {
      tween.kill();
    };
  }, [index, state.reduced]);

  useFrame(() => {
    const mat = matRef.current;
    if (!mat) return;
    mat.uniforms.uColor.value.copy(state.palette.ink);

    // The only emphasis source now: the electron on this orbit is near the
    // cursor. Smoothly chase that target so the ring brightens/eases off.
    const target = emphasisRef.current;
    const curr = mat.uniforms.uEmphasis.value as number;
    mat.uniforms.uEmphasis.value = curr + (target - curr) * 0.12;
  });

  return (
    <lineLoop geometry={geometry} rotation={[0, 0, rotation]}>
      <shaderMaterial
        ref={matRef}
        vertexShader={ORBIT_VERT}
        fragmentShader={ORBIT_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </lineLoop>
  );
}

// ─── electron ──────────────────────────────────────────────────────────────

function Electron({
  orbit,
  state,
  emphasisRef,
}: {
  orbit: OrbitDef;
  state: SharedState;
  emphasisRef: { current: number };
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uColor: { value: state.palette[orbit.hue].clone() },
      uIntensity: { value: 0.0 }, // fades in via GSAP
      uCoreRadius: { value: 0.23 },
      uHaloFalloff: { value: 0.95 },
      uHaloMix: { value: 0.34 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Resting position at t=0, used for the initial mesh placement.
  const initial = useMemo<[number, number, number]>(() => {
    const lx = Math.cos(orbit.phase) * ELLIPSE_A;
    const ly = Math.sin(orbit.phase) * ELLIPSE_B;
    const [x, y] = rotatePoint(lx, ly, orbit.rotation);
    return [x, y, 0.5];
  }, [orbit.phase, orbit.rotation]);

  // GSAP entry — electrons pop in FIRST, randomly across a window so they
  // don't read as a sequenced reveal. Orbit lines fan out afterward.
  const entryDelay = useMemo(() => 0.15 + Math.random() * 0.9, []);

  useEffect(() => {
    if (!matRef.current) return;
    const target = 1.05;
    if (state.reduced) {
      matRef.current.uniforms.uIntensity.value = target;
      return;
    }
    const tween = gsap.fromTo(
      matRef.current.uniforms.uIntensity,
      { value: 0 },
      {
        value: target,
        duration: 0.45,
        ease: "back.out(2.2)",
        delay: entryDelay,
      }
    );
    return () => {
      tween.kill();
    };
  }, [entryDelay, state.reduced]);

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    // Position on the rotated ellipse.
    const t = clock.elapsedTime;
    const theta = orbit.phase + (state.reduced ? 0 : t * ELECTRON_SPEED);
    const lx = Math.cos(theta) * ELLIPSE_A;
    const ly = Math.sin(theta) * ELLIPSE_B;
    let [x, y] = rotatePoint(lx, ly, orbit.rotation);

    // Subtle cursor influence: pull the electron toward the cursor when close.
    if (state.cursorActive && !state.reduced) {
      const dx = state.cursor.x - x;
      const dy = state.cursor.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < CURSOR_DRIFT_RADIUS && dist > 0.01) {
        const force = ((CURSOR_DRIFT_RADIUS - dist) / CURSOR_DRIFT_RADIUS) * 1.6;
        x += (dx / dist) * force;
        y += (dy / dist) * force;
      }
    }

    // Electrons ride slightly in front (z) so they read over rings + nucleus.
    mesh.position.set(x, y, 0.5);

    // Hover proximity — drives both electron intensity and orbit emphasis.
    let near = 0;
    if (state.cursorActive) {
      const d = Math.hypot(state.cursor.x - x, state.cursor.y - y);
      if (d < HOVER_RADIUS) near = 1 - d / HOVER_RADIUS;
    }
    emphasisRef.current = near;

    // Smooth intensity boost on hover.
    const lerp = Math.min(1, delta * 7);
    const baseIntensity = state.reduced ? 1.05 : 1.05 + near * 0.6;
    const curr = mat.uniforms.uIntensity.value as number;
    mat.uniforms.uIntensity.value = curr + (baseIntensity - curr) * lerp;

    // Re-sync palette colour each frame (cheap; handles theme flips).
    mat.uniforms.uColor.value.copy(state.palette[orbit.hue]);
    mat.uniforms.uHaloMix.value = state.lightTheme ? 0 : 0.34;
  });

  return (
    <mesh ref={meshRef} position={initial} renderOrder={2}>
      <planeGeometry args={[ELECTRON_SIZE * 5, ELECTRON_SIZE * 5]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={BODY_VERT}
        fragmentShader={BODY_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── orbit + electron pair ─────────────────────────────────────────────────

// One ellipse and its electron share an emphasisRef so the ring brightens
// whenever the cursor nears that orbit's electron.
function OrbitSystem({
  orbit,
  geometry,
  state,
}: {
  orbit: OrbitDef;
  geometry: THREE.BufferGeometry;
  state: SharedState;
}) {
  const emphasisRef = useRef(0);
  return (
    <>
      <OrbitLine
        geometry={geometry}
        rotation={orbit.rotation}
        state={state}
        emphasisRef={emphasisRef}
        index={orbit.id}
      />
      <Electron orbit={orbit} state={state} emphasisRef={emphasisRef} />
    </>
  );
}

// ─── cursor picker ───────────────────────────────────────────────────────

function CursorPicker({ state }: { state: SharedState }) {
  const { camera, gl, size } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    const handleMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Convert pointer to world coords for our orthographic camera.
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      // For ortho camera: world = ndc * 0.5 * (right-left), centred.
      if (camera instanceof THREE.OrthographicCamera) {
        const wx =
          (camera.left + camera.right) / 2 +
          ((camera.right - camera.left) / 2) * ndc.x;
        const wy =
          (camera.top + camera.bottom) / 2 +
          ((camera.top - camera.bottom) / 2) * ndc.y;
        state.cursor.set(wx, wy, 0);
        state.cursorActive = true;
      }
    };

    const handleLeave = () => {
      state.cursorActive = false;
    };

    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerleave", handleLeave);
    return () => {
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerleave", handleLeave);
    };
  }, [camera, gl, state, size]);

  return null;
}

// ─── scene root ──────────────────────────────────────────────────────────

function Scene({ state }: { state: SharedState }) {
  // One ellipse geometry, shared by all six orbits — each <OrbitLine> just
  // rotates it about z. Cheap and keeps the rings perfectly congruent.
  const ellipseGeometry = useMemo(() => {
    const positions = new Float32Array(ORBIT_SEGMENTS * 3);
    for (let i = 0; i < ORBIT_SEGMENTS; i++) {
      const angle = (i / ORBIT_SEGMENTS) * Math.PI * 2;
      positions[i * 3 + 0] = Math.cos(angle) * ELLIPSE_A;
      positions[i * 3 + 1] = Math.sin(angle) * ELLIPSE_B;
      positions[i * 3 + 2] = 0;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useEffect(() => () => ellipseGeometry.dispose(), [ellipseGeometry]);

  return (
    <>
      <CameraSetup />
      <CursorPicker state={state} />
      <Nucleus state={state} />
      {ORBITS.map((o) => (
        <OrbitSystem
          key={o.id}
          orbit={o}
          geometry={ellipseGeometry}
          state={state}
        />
      ))}
    </>
  );
}

// ─── public component ───────────────────────────────────────────────────

export function ServicesHeroSolarSystem({
  className = "",
}: {
  className?: string;
}) {
  const reduced =
    typeof window === "undefined" ? false : prefersReducedMotion();

  const stateRef = useRef<SharedState>({
    cursor: new THREE.Vector3(1e6, 1e6, 0),
    cursorActive: false,
    palette: {
      ink: new THREE.Color("#a3a3ad"),
      accent: new THREE.Color("#e89348"),
      violet: new THREE.Color("#5b2db5"),
      magenta: new THREE.Color("#c2186a"),
    },
    reduced,
    lightTheme: false,
  });

  // Resolve real palette on mount + listen for theme flips.
  useEffect(() => {
    const apply = () => {
      const fresh = readPalette();
      (Object.keys(fresh) as Hue[]).forEach((hue) => {
        stateRef.current.palette[hue].copy(fresh[hue]);
      });
      stateRef.current.lightTheme =
        document.documentElement.getAttribute("data-theme") === "light";
    };
    apply();
    const obs = new MutationObserver(apply);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 1, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
        style={{ background: "transparent" }}
      >
        <Scene state={stateRef.current} />
      </Canvas>
    </div>
  );
}
