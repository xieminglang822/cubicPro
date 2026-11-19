import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { faceletCell, stickerColor } from '../puzzle/facelets';
import type { Move } from '../types/cube';
import { dragToMove } from './dragTurn';

export interface CubeViewProps {
  /** 54-char Kociemba-ordered facelet string. */
  facelets: string;
  /** Called when the user drags a face to turn it. */
  onMove?: (move: Move) => void;
  interactive?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

const AXES: Array<[number, number, number]> = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Three.js cube. Drag on a sticker to turn that layer; drag on the background
 * to orbit; wheel / two fingers to zoom. Sticker colours come straight from the
 * facelet string, so the view is a pure function of state.
 */
export function CubeView({ facelets, onMove, reducedMotion, className }: CubeViewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stickersRef = useRef<THREE.Mesh[]>([]);
  const viewRef = useRef({ theta: 0.75, phi: 1.0, radius: 7.2 });
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    canvas.style.cursor = 'grab';

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
    const bodies: THREE.Mesh[] = [];

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
          body.position.set(x, y, z);
          body.userData.lattice = new THREE.Vector3(x, y, z);
          bodies.push(body);
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
      mesh.lookAt(mesh.position.clone().add(new THREE.Vector3(...cell.normal)));
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
    const raycaster = new THREE.Raycaster();
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let turnDrag:
      | { lattice: THREE.Vector3; normal: THREE.Vector3; startX: number; startY: number; consumed: boolean }
      | null = null;

    const projectToScreen = (point: THREE.Vector3) => {
      const p = point.clone().project(camera);
      const rect = canvas.getBoundingClientRect();
      return {
        x: (p.x * 0.5 + 0.5) * rect.width,
        y: (-p.y * 0.5 + 0.5) * rect.height,
      };
    };

    const tangentForDrag = (dragX: number, dragY: number, lattice: THREE.Vector3, normal: THREE.Vector3) => {
      const base = lattice.clone().addScaledVector(normal, 0.5);
      const origin = projectToScreen(base);
      let best: { strength: number; axis: [number, number, number] } | null = null;
      for (const axis of AXES) {
        const axisVec = new THREE.Vector3(axis[0], axis[1], axis[2]);
        if (Math.abs(axisVec.dot(normal)) > 0.5) continue;
        const end = projectToScreen(base.clone().addScaledVector(axisVec, 0.3));
        const dx = end.x - origin.x;
        const dy = end.y - origin.y;
        const length = Math.hypot(dx, dy);
        if (length < 1e-4) continue;
        const strength = (dragX * dx + dragY * dy) / length;
        if (!best || Math.abs(strength) > Math.abs(best.strength)) {
          best = { strength, axis };
        }
      }
      if (!best) return null;
      const sign = best.strength >= 0 ? 1 : -1;
      return [best.axis[0] * sign, best.axis[1] * sign, best.axis[2] * sign] as [number, number, number];
    };

    const onPointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(bodies, false);
      const hit = hits[0];
      if (hit?.face) {
        turnDrag = {
          lattice: (hit.object.userData.lattice as THREE.Vector3).clone(),
          normal: hit.face.normal.clone(),
          startX: event.clientX,
          startY: event.clientY,
          consumed: false,
        };
        return;
      }
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.style.cursor = 'grabbing';
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (turnDrag) {
        if (turnDrag.consumed) return;
        const dragX = event.clientX - turnDrag.startX;
        const dragY = event.clientY - turnDrag.startY;
        if (Math.hypot(dragX, dragY) < 6) return;
        const tangent = tangentForDrag(dragX, dragY, turnDrag.lattice, turnDrag.normal);
        if (tangent) {
          const move = dragToMove(
            [turnDrag.lattice.x, turnDrag.lattice.y, turnDrag.lattice.z],
            [turnDrag.normal.x, turnDrag.normal.y, turnDrag.normal.z],
            tangent,
          );
          if (move) onMoveRef.current?.(move);
        }
        turnDrag.consumed = true;
        return;
      }
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
      turnDrag = null;
      canvas.style.cursor = 'grab';
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      view.radius = clamp(view.radius + event.deltaY * 0.0035, 4.2, 13);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

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
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      renderer.dispose();
      bodyGeometry.dispose();
      stickerGeometry.dispose();
      for (const sticker of stickers) (sticker.material as THREE.Material).dispose();
      if (canvas.parentElement === mount) mount.removeChild(canvas);
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
