import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import { faceletCell, stickerColor } from '../puzzle/facelets';
import type { FaceName, Move } from '../types/cube';
import { dragToMove } from './dragTurn';

export interface AssistLabels {
  /** Human label for the selected layer, e.g. "upper layer". */
  layer: (face: FaceName) => string;
  cw: string;
  ccw: string;
}

export interface CubeViewProps {
  /** 54-char Kociemba-ordered facelet string. */
  facelets: string;
  /** Called when the user turns a face (drag or assist arrows). */
  onMove?: (move: Move) => void;
  /** Beginner assist: hover/tap a face to highlight it and show turn arrows. */
  assistEnabled?: boolean;
  assistLabels?: AssistLabels;
  reducedMotion?: boolean;
  className?: string;
}

const AXES: Array<[number, number, number]> = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

const FACE_NORMAL: Record<FaceName, [number, number, number]> = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  R: [1, 0, 0],
  L: [-1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
};

function normalToFace(normal: THREE.Vector3): FaceName | null {
  const x = Math.round(normal.x);
  const y = Math.round(normal.y);
  const z = Math.round(normal.z);
  if (x === 1) return 'R';
  if (x === -1) return 'L';
  if (y === 1) return 'U';
  if (y === -1) return 'D';
  if (z === 1) return 'F';
  if (z === -1) return 'B';
  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function CubeView({ facelets, onMove, assistEnabled, assistLabels, reducedMotion, className }: CubeViewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stickersRef = useRef<THREE.Mesh[]>([]);
  const highlightRef = useRef<THREE.Mesh | null>(null);
  const viewRef = useRef({ theta: 0.7, phi: 1.05, radius: 8.4 });
  const onMoveRef = useRef(onMove);
  const assistRef = useRef(!!assistEnabled);
  const [selectedFace, setSelectedFace] = useState<FaceName | null>(null);
  onMoveRef.current = onMove;
  assistRef.current = !!assistEnabled;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
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

    // Selection highlight for the beginner-assist overlay: a subtle fill plus a
    // blue outline so the sticker colours stay readable.
    const highlightCanvas = document.createElement('canvas');
    highlightCanvas.width = 256;
    highlightCanvas.height = 256;
    const hlCtx = highlightCanvas.getContext('2d');
    if (hlCtx) {
      hlCtx.clearRect(0, 0, 256, 256);
      hlCtx.fillStyle = 'rgba(96, 165, 250, 0.16)';
      hlCtx.fillRect(0, 0, 256, 256);
      hlCtx.strokeStyle = 'rgba(96, 165, 250, 0.95)';
      hlCtx.lineWidth = 18;
      hlCtx.strokeRect(10, 10, 236, 236);
    }
    const highlightTexture = new THREE.CanvasTexture(highlightCanvas);
    highlightTexture.colorSpace = THREE.SRGBColorSpace;
    const highlight = new THREE.Mesh(
      new THREE.PlaneGeometry(2.9, 2.9),
      new THREE.MeshBasicMaterial({
        map: highlightTexture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    highlight.visible = false;
    scene.add(highlight);
    highlightRef.current = highlight;

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
    let selected: FaceName | null = null;
    let turnDrag:
      | { lattice: THREE.Vector3; normal: THREE.Vector3; startX: number; startY: number; consumed: boolean }
      | null = null;

    const setFace = (face: FaceName | null) => {
      if (face === selected) return;
      selected = face;
      setSelectedFace(face);
    };

    const raycastPointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(bodies, false);
      return hits[0] ?? null;
    };

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
      const hit = raycastPointer(event.clientX, event.clientY);
      const face = hit?.face ? normalToFace(hit.face.normal) : null;
      if (assistRef.current && face) setFace(face);

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
      // Hovering (no active gesture) updates the selected face.
      if (assistRef.current && !dragging && !turnDrag) {
        const hit = raycastPointer(event.clientX, event.clientY);
        const face = hit?.face ? normalToFace(hit.face.normal) : null;
        if (face && face !== selected) setFace(face);
      }

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
    // Keyboard-only users can orbit and zoom the view.
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      switch (event.key) {
        case 'ArrowLeft':
          view.theta += 0.18;
          event.preventDefault();
          break;
        case 'ArrowRight':
          view.theta -= 0.18;
          event.preventDefault();
          break;
        case 'ArrowUp':
          view.phi = clamp(view.phi - 0.12, 0.12, Math.PI - 0.12);
          event.preventDefault();
          break;
        case 'ArrowDown':
          view.phi = clamp(view.phi + 0.12, 0.12, Math.PI - 0.12);
          event.preventDefault();
          break;
        case '+':
        case '=':
          view.radius = clamp(view.radius - 0.4, 4.2, 13);
          event.preventDefault();
          break;
        case '-':
        case '_':
          view.radius = clamp(view.radius + 0.4, 4.2, 13);
          event.preventDefault();
          break;
        default:
          break;
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const { theta, phi, radius } = view;
      camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta),
      );
      camera.lookAt(0, 0, 0);

      const active = assistRef.current && selected !== null;
      if (active && selected) {
        const n = FACE_NORMAL[selected];
        highlight.visible = true;
        highlight.position.set(n[0] * 1.52, n[1] * 1.52, n[2] * 1.52);
        highlight.lookAt(highlight.position.clone().add(new THREE.Vector3(n[0], n[1], n[2])));

        const overlay = overlayRef.current;
        if (overlay) {
          const p = new THREE.Vector3(n[0] * 1.9, n[1] * 1.9, n[2] * 1.9).project(camera);
          const rect = canvas.getBoundingClientRect();
          const faceX = (p.x * 0.5 + 0.5) * rect.width;
          const faceY = (-p.y * 0.5 + 0.5) * rect.height;
          // Push the legend radially outward from the cube's screen centre so
          // it never covers the cube centre or the drag path.
          const outX = faceX - rect.width / 2;
          const outY = faceY - rect.height / 2;
          const length = Math.hypot(outX, outY) || 1;
          const offset = 84;
          const x = clamp(faceX + (outX / length) * offset, 56, rect.width - 56);
          const y = clamp(faceY + (outY / length) * offset, 34, rect.height - 34);
          overlay.style.left = `${x}px`;
          overlay.style.top = `${y}px`;
          overlay.style.display = 'flex';
        }
      } else {
        highlight.visible = false;
        if (overlayRef.current) overlayRef.current.style.display = 'none';
      }

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
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('wheel', onWheel);
      renderer.dispose();
      bodyGeometry.dispose();
      stickerGeometry.dispose();
      highlight.geometry.dispose();
      (highlight.material as THREE.Material).dispose();
      highlightTexture.dispose();
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

  const showAssist = !!assistEnabled && selectedFace !== null;

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      {showAssist && selectedFace && (
        <div ref={overlayRef} className="cube-assist" style={{ display: 'none' }}>
          <div className="cube-assist-label">{assistLabels?.layer(selectedFace)}</div>
          <div className="cube-assist-buttons">
            <button
              type="button"
              aria-label={assistLabels?.ccw}
              title={assistLabels?.ccw}
              onClick={() => onMoveRef.current?.({ face: selectedFace, turns: -1 })}
            >
              ⟲
            </button>
            <button
              type="button"
              aria-label={assistLabels?.cw}
              title={assistLabels?.cw}
              onClick={() => onMoveRef.current?.({ face: selectedFace, turns: 1 })}
            >
              ⟳
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
