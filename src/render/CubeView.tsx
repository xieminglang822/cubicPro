import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { faceletCell, stickerColor } from '../puzzle/facelets';
import type { Move } from '../types/cube';

export interface CubeViewProps {
  /** 54-char Kociemba-ordered facelet string. */
  facelets: string;
  /** Reserved for drag-to-turn (not wired yet); kept in the contract. */
  onMove?: (move: Move) => void;
  interactive?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * A Three.js rendering of the cube. Drag to orbit, wheel/pinch to zoom.
 * Sticker colours are derived directly from the facelet string, so the view
 * is a pure function of state (no internal animation bookkeeping).
 */
export function CubeView({ facelets, reducedMotion, className }: CubeViewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stickersRef = useRef<THREE.Mesh[]>([]);
  const viewRef = useRef({ theta: 0.75, phi: 1.0, radius: 7.2 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'grab';

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(6, 9, 7);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-7, -5, -6);
    scene.add(fillLight);

    const cube = new THREE.Group();
    scene.add(cube);

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.65, metalness: 0.1 });
    const bodyGeometry = new THREE.BoxGeometry(0.96, 0.96, 0.96);

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
          body.position.set(x, y, z);
          cube.add(body);
        }
      }
    }

    const stickers: THREE.Mesh[] = [];
    const stickerGeometry = new THREE.PlaneGeometry(0.9, 0.9);
    for (let i = 0; i < 54; i++) {
      const cell = faceletCell(i);
      const material = new THREE.MeshBasicMaterial({ color: stickerColor(facelets[i] ?? 'U') });
      const mesh = new THREE.Mesh(stickerGeometry, material);
      const offset = 0.505;
      mesh.position.set(
        cell.pos[0] + cell.normal[0] * offset,
        cell.pos[1] + cell.normal[1] * offset,
        cell.pos[2] + cell.normal[2] * offset,
      );
      const target = mesh.position.clone().add(new THREE.Vector3(...cell.normal));
      mesh.lookAt(target);
      cube.add(mesh);
      stickers.push(mesh);
    }
    stickersRef.current = stickers;

    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const view = viewRef.current;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.style.cursor = 'grabbing';
      try {
        renderer.domElement.setPointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      view.theta -= dx * 0.01;
      view.phi = clamp(view.phi - dy * 0.01, 0.12, Math.PI - 0.12);
    };
    const onPointerUp = () => {
      dragging = false;
      renderer.domElement.style.cursor = 'grab';
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      view.radius = clamp(view.radius + event.deltaY * 0.0035, 4.2, 13);
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    let raf = 0;
    let spin = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!reducedMotion && !dragging) spin += 0.0016;
      const theta = view.theta + spin;
      const { phi, radius } = view;
      camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta),
      );
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
      bodyGeometry.dispose();
      stickerGeometry.dispose();
      for (const sticker of stickers) {
        (sticker.material as THREE.Material).dispose();
      }
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const stickers = stickersRef.current;
    for (let i = 0; i < stickers.length && i < facelets.length; i++) {
      const mesh = stickers[i];
      if (mesh) (mesh.material as THREE.MeshBasicMaterial).color.set(stickerColor(facelets[i]));
    }
  }, [facelets]);

  return <div ref={mountRef} className={className} style={{ width: '100%', height: '100%' }} />;
}
