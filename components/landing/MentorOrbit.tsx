"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import styles from "./MentorOrbit.module.css";

interface Props { enabled: boolean; running: boolean }

/** Quiet stationary tracks; only three tiny points travel around the phone. */
export function MentorOrbit({ enabled, running }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(running);
  const anglesRef = useRef([0.7, 3.1, 5.2]);
  const controlRef = useRef<((active: boolean) => void) | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    runningRef.current = running;
    controlRef.current?.(running);
  }, [running]);

  useEffect(() => {
    const host = hostRef.current;
    if (!enabled || !host) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void import("three").then((THREE) => {
      if (cancelled) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      } catch { return; }

      const dark = theme === "dark";
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-4.3, 4.3, 3.2, -3.2, 0.1, 20);
      camera.position.z = 10;
      const resources = new Set<{ dispose: () => void }>();
      const track = <T extends { dispose: () => void }>(item: T): T => { resources.add(item); return item; };
      const pointGeometry = track(new THREE.SphereGeometry(0.035, 8, 6));
      const haloGeometry = track(new THREE.SphereGeometry(0.085, 8, 6));
      const rotations = [-0.52, 0.4, -0.88];
      const periods = [18, 22, 26];
      const colors = dark ? [0xb4a4d3, 0x9cbfb7, 0xa5a3c7] : [0xa99abb, 0x8caeaa, 0xa5a1ba];
      const orbitPoint = (angle: number, index: number, point: InstanceType<typeof THREE.Vector3>) => {
        const x = Math.cos(angle) * 3.35;
        const y = Math.sin(angle) * (1.12 + index * 0.12);
        const rotation = rotations[index];
        return point.set(x * Math.cos(rotation) - y * Math.sin(rotation), x * Math.sin(rotation) + y * Math.cos(rotation), 0);
      };
      const orbits = colors.map((color, index) => {
        const points = Array.from({ length: 128 }, (_, segment) => orbitPoint(segment / 128 * Math.PI * 2, index, new THREE.Vector3()));
        const geometry = track(new THREE.BufferGeometry().setFromPoints(points));
        const material = track(new THREE.LineBasicMaterial({ color, transparent: true, opacity: dark ? 0.18 : 0.28, depthWrite: false }));
        scene.add(new THREE.LineLoop(geometry, material));
        const point = new THREE.Mesh(pointGeometry, track(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: dark ? 0.8 : 0.65 })));
        const halo = new THREE.Mesh(haloGeometry, track(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, depthWrite: false })));
        scene.add(point, halo);
        return { point, halo };
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      host.appendChild(renderer.domElement);
      let contextLost = false;
      let lastFrame = 0;
      const position = new THREE.Vector3();
      const draw = (time: number, advance = true) => {
        if (contextLost || cancelled) return;
        const delta = advance && lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0;
        lastFrame = advance ? time : 0;
        orbits.forEach(({ point, halo }, index) => {
          anglesRef.current[index] = (anglesRef.current[index] + delta * Math.PI * 2 / periods[index]) % (Math.PI * 2);
          orbitPoint(anglesRef.current[index], index, position);
          point.position.copy(position);
          halo.position.copy(position);
        });
        renderer.render(scene, camera);
      };
      const resize = () => {
        if (contextLost || cancelled) return;
        const { width, height } = host.getBoundingClientRect();
        if (!width || !height) return;
        camera.left = -3.2 * width / height;
        camera.right = 3.2 * width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        draw(performance.now(), false);
      };
      const control = (active: boolean) => {
        lastFrame = 0;
        const canRun = active && !contextLost;
        host.dataset.running = String(canRun);
        renderer.setAnimationLoop(canRun ? (time) => draw(time) : null);
      };
      controlRef.current = control;
      const observer = new ResizeObserver(resize);
      observer.observe(host);
      resize();
      host.dataset.ready = "true";
      control(runningRef.current);

      const onContextLost = (event: Event) => {
        event.preventDefault();
        contextLost = true;
        renderer.setAnimationLoop(null);
        host.dataset.running = "false";
        delete host.dataset.ready;
      };
      const onContextRestored = () => {
        contextLost = false;
        resize();
        host.dataset.ready = "true";
        control(runningRef.current);
      };
      renderer.domElement.addEventListener("webglcontextlost", onContextLost);
      renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
      cleanup = () => {
        controlRef.current = null;
        renderer.setAnimationLoop(null);
        observer.disconnect();
        renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
        renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
        resources.forEach((resource) => resource.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
        delete host.dataset.ready;
        delete host.dataset.running;
      };
    }).catch(() => { /* Static SVG remains when WebGL cannot initialize. */ });
    return () => { cancelled = true; cleanup?.(); };
  }, [enabled, theme]);

  return (
    <div ref={hostRef} className={styles.orbit} aria-hidden="true">
      <svg className={styles.fallback} viewBox="0 0 510 380" fill="none">
        <ellipse cx="255" cy="190" rx="199" ry="67" transform="rotate(-30 255 190)" />
        <ellipse cx="255" cy="190" rx="199" ry="74" transform="rotate(23 255 190)" />
        <ellipse cx="255" cy="190" rx="199" ry="81" transform="rotate(-50 255 190)" />
        <circle cx="97" cy="259" r="2" /><circle cx="412" cy="98" r="2" />
      </svg>
    </div>
  );
}
