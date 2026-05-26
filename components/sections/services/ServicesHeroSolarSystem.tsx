"use client";

/**
 * ServicesHeroSolarSystem
 * -----------------------
 * Top-down (aerial) solar system for the Services hero. 1 sun + 6 planets
 * on circular orbits, each at a different radius / speed / hue. Calm,
 * cinematic motion — inner planets rotate faster than outer ones (Kepler-
 * ish feel without the realism baggage).
 *
 * Built to match the AboutHeroNetwork's complexity profile:
 *   - React Three Fiber, single Canvas, orthographic camera
 *   - Plane-meshes with a soft-circle fragment shader for each body
 *   - LineLoop with a shader for each orbital path
 *   - GSAP staggers entry (orbits fade in first, then planets + sun)
 *   - Cursor near a planet brightens it AND its orbit
 *   - Colors resolve from --color-* tokens so the visual flips with theme
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/motion";

// ─── types & data ────────────────────────────────────────────────────────

type Hue = "ink" | "accent" | "violet" | "magenta";

type PlanetDef = {
  readonly id: number;
  readonly orbitRadius: number;
  readonly size: number;
  /** rad/sec — inner planets revolve faster, like Kepler's third law. */
  readonly speed: number;
  /** Initial angular offset on the orbit. */
  readonly phase: number;
  readonly hue: Hue;
};

const PLANETS: readonly PlanetDef[] = [
  { id: 0, orbitRadius: 11, size: 1.5, speed: 0.22,  phase: 0.0, hue: "accent" },
  { id: 1, orbitRadius: 17, size: 1.1, speed: 0.16,  phase: 1.3, hue: "ink"    },
  { id: 2, orbitRadius: 24, size: 1.9, speed: 0.11,  phase: 2.5, hue: "violet" },
  { id: 3, orbitRadius: 31, size: 1.3, speed: 0.082, phase: 4.0, hue: "ink"    },
  { id: 4, orbitRadius: 38, size: 1.7, speed: 0.062, phase: 5.2, hue: "magenta" },
  { id: 5, orbitRadius: 45, size: 1.2, speed: 0.048, phase: 0.7, hue: "ink"    },
] as const;

const SUN_SIZE = 2.8;
const ORBIT_SEGMENTS = 96;
const HOVER_RADIUS = 6;          // world units within which cursor brightens a planet
const CURSOR_DRIFT_RADIUS = 14;  // world units within which cursor nudges nearby planets
/** How close (in world units) the cursor needs to be to the orbit ring itself to light it up. */
const ORBIT_HOVER_BAND = 3.2;

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

// Flat shader for the radar wavefront rings and the active-orbit halo band.
// Opacity is the whole envelope; the host code modulates it each frame.
const FLAT_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
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

// ─── sun ─────────────────────────────────────────────────────────────────

function Sun({ state }: { state: SharedState }) {
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

  // Soft heartbeat — sun breathes very subtly so it doesn't feel inert.
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
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[SUN_SIZE * 5, SUN_SIZE * 5]} />
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

function Orbit({
  radius,
  state,
  emphasisRef,
  orbitIndex,
  totalOrbits,
}: {
  radius: number;
  state: SharedState;
  /** Per-planet emphasis level (0..1) that this orbit should mirror. */
  emphasisRef: { current: number };
  /** Index of this orbit (0 = innermost). Drives the sequential pulse phase. */
  orbitIndex: number;
  /** Total orbit count so phases space evenly through the wave cycle. */
  totalOrbits: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  // Halo ring fades in beneath the thin orbit line when the planet on this
  // orbit becomes active — makes the active orbit's stroke read as visibly
  // wider without us needing thick-line geometry (WebGL line widths > 1px
  // are unreliable cross-browser).
  const haloMatRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(ORBIT_SEGMENTS * 3);
    for (let i = 0; i < ORBIT_SEGMENTS; i++) {
      const angle = (i / ORBIT_SEGMENTS) * Math.PI * 2;
      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = 0;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [radius]);

  const uniforms = useMemo(
    () => ({
      uColor: { value: state.palette.ink.clone() },
      uOpacity: { value: 0.0 }, // tweened in by GSAP on mount
      uEmphasis: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const haloUniforms = useMemo(
    () => ({
      uColor: { value: state.palette.accent.clone() },
      uOpacity: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // GSAP entry — orbits fade in AFTER planets have popped in, staggered
  // by their radius so the rings appear from the centre outward.
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
      delay: 1.2 + radius * 0.012,
    });
    return () => {
      tween.kill();
    };
  }, [radius, state.reduced]);

  useFrame(({ clock }) => {
    const mat = matRef.current;
    if (!mat) return;
    mat.uniforms.uColor.value.copy(state.palette.ink);

    // ── Three emphasis sources, combined via Math.max ────────────────────
    //   1. The planet on this orbit is being hovered (from emphasisRef)
    //   2. The cursor is directly over this orbit ring (radial hit test)
    //   3. The sequential inside-out pulse — a wave travels through orbits
    //      from innermost to outermost, briefly emphasising each in turn.
    let target = emphasisRef.current;

    if (state.cursorActive) {
      const distFromCenter = Math.hypot(state.cursor.x, state.cursor.y);
      const distFromRing = Math.abs(distFromCenter - radius);
      if (distFromRing < ORBIT_HOVER_BAND) {
        const ringEmphasis = 1 - distFromRing / ORBIT_HOVER_BAND;
        if (ringEmphasis > target) target = ringEmphasis;
      }
    }

    // Sequential pulse — cycle every PULSE_CYCLE_SEC; each orbit is the wave
    // crest for a narrow window of that cycle. Phase = (orbitIndex+1)/total
    // so the wave starts AT the innermost ring rather than around the sun.
    if (!state.reduced) {
      const PULSE_CYCLE_SEC = 4.5;
      const PULSE_WIDTH = 0.16; // fraction of the cycle each orbit is lit
      const PULSE_MAX = 0.85;   // peak emphasis injected by the pulse
      const cyclePhase = (clock.elapsedTime / PULSE_CYCLE_SEC) % 1;
      const orbitPhase = (orbitIndex + 1) / (totalOrbits + 1);
      const raw = Math.abs(cyclePhase - orbitPhase);
      const wrapped = Math.min(raw, 1 - raw);
      const pulseAmt =
        wrapped < PULSE_WIDTH
          ? Math.cos((wrapped / PULSE_WIDTH) * (Math.PI / 2)) * PULSE_MAX
          : 0;
      if (pulseAmt > target) target = pulseAmt;
    }

    const curr = mat.uniforms.uEmphasis.value as number;
    mat.uniforms.uEmphasis.value = curr + (target - curr) * 0.12;

    // Halo band: opacity drives both visibility and apparent width. When
    // the orbit is inactive (target ≈ 0) the band disappears; when active
    // (cursor OR pulse) it lifts so the orbit reads as a wider stroke.
    const haloMat = haloMatRef.current;
    if (haloMat) {
      haloMat.uniforms.uColor.value.copy(state.palette.accent);
      const haloTarget = Math.max(0, target - 0.05) * 0.55;
      const haloCurr = haloMat.uniforms.uOpacity.value as number;
      haloMat.uniforms.uOpacity.value = haloCurr + (haloTarget - haloCurr) * 0.1;
    }
  });

  return (
    <>
      <mesh>
        <ringGeometry args={[radius - 0.45, radius + 0.45, ORBIT_SEGMENTS]} />
        <shaderMaterial
          ref={haloMatRef}
          vertexShader={ORBIT_VERT}
          fragmentShader={FLAT_FRAG}
          uniforms={haloUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
      <lineLoop geometry={geometry}>
        <shaderMaterial
          ref={matRef}
          vertexShader={ORBIT_VERT}
          fragmentShader={ORBIT_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </lineLoop>
    </>
  );
}

// ─── planet ──────────────────────────────────────────────────────────────

function Planet({
  planet,
  state,
}: {
  planet: PlanetDef;
  state: SharedState;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  // Shared with the planet's <Orbit>; updated each frame from this planet's
  // current hover proximity. Refs avoid React re-render churn.
  const emphasisRef = useRef(0);

  const uniforms = useMemo(
    () => ({
      uColor: { value: state.palette[planet.hue].clone() },
      uIntensity: { value: 0.0 }, // fades in via GSAP
      uCoreRadius: { value: 0.23 },
      uHaloFalloff: { value: 0.95 },
      uHaloMix: { value: 0.34 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // GSAP entry — planets pop in FIRST, randomly across a window so they
  // don't read as a sequenced reveal. Orbit lines fade in afterward.
  const entryDelay = useMemo(
    () => 0.15 + Math.random() * 0.9,
    []
  );

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

    // Orbital position.
    const t = clock.elapsedTime;
    const angle = planet.phase + (state.reduced ? 0 : t * planet.speed);
    let x = Math.cos(angle) * planet.orbitRadius;
    let y = Math.sin(angle) * planet.orbitRadius;

    // Subtle cursor influence: pull planet toward cursor when close.
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

    mesh.position.set(x, y, 0);

    // Hover proximity — drives both planet intensity and orbit emphasis.
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
    mat.uniforms.uColor.value.copy(state.palette[planet.hue]);
    mat.uniforms.uHaloMix.value = state.lightTheme ? 0 : 0.34;
  });

  // The orbit sits next to the planet in the JSX tree so they share the
  // emphasisRef — the orbit fades in proximity-emphasis whenever its planet
  // is the nearest body to the cursor.
  return (
    <>
      <Orbit
        radius={planet.orbitRadius}
        state={state}
        emphasisRef={emphasisRef}
        orbitIndex={planet.id}
        totalOrbits={PLANETS.length}
      />
      <mesh
        ref={meshRef}
        position={[
          Math.cos(planet.phase) * planet.orbitRadius,
          Math.sin(planet.phase) * planet.orbitRadius,
          0,
        ]}
      >
        <planeGeometry args={[planet.size * 5, planet.size * 5]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={BODY_VERT}
          fragmentShader={BODY_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
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
        const wx = (camera.left + camera.right) / 2 +
          ((camera.right - camera.left) / 2) * ndc.x;
        const wy = (camera.top + camera.bottom) / 2 +
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
  return (
    <>
      <CameraSetup />
      <CursorPicker state={state} />
      <Sun state={state} />
      {PLANETS.map((p) => (
        <Planet key={p.id} planet={p} state={state} />
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
