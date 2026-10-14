import { useEffect, useRef } from "react";
import * as THREE from "three";

interface FloatingObject {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
  basePosition: THREE.Vector3;
  driftOffset: number;
  rotationSpeed: THREE.Vector3;
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export default function HeroBackground3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!container || reducedMotionQuery.matches || !supportsWebGL()) {
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));

    const keyLight = new THREE.DirectionalLight(0xbfdbfe, 2.5);
    keyLight.position.set(3, 5, 6);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x818cf8, 8, 18);
    fillLight.position.set(-5, -2, 5);
    scene.add(fillLight);

    const colors = [0x2563eb, 0x0ea5e9, 0x4f46e5, 0x60a5fa, 0x6366f1];
    const floatingObjects: FloatingObject[] = [];

    for (let index = 0; index < 16; index += 1) {
      const isSphere = index >= 12;
      const geometry = isSphere
        ? new THREE.SphereGeometry(0.22 + Math.random() * 0.2, 20, 16)
        : new THREE.CylinderGeometry(0.3 + Math.random() * 0.28, 0.3 + Math.random() * 0.28, 0.1 + Math.random() * 0.09, 40);
      const material = new THREE.MeshStandardMaterial({
        color: colors[index % colors.length],
        transparent: true,
        opacity: isSphere ? 0.22 : 0.18,
        roughness: 0.38,
        metalness: 0.18,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const basePosition = new THREE.Vector3(
        (Math.random() - 0.5) * 11,
        (Math.random() - 0.5) * 6.5,
        -1.5 + Math.random() * 3
      );

      mesh.position.copy(basePosition);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(mesh);
      floatingObjects.push({
        mesh,
        basePosition,
        driftOffset: Math.random() * Math.PI * 2,
        rotationSpeed: new THREE.Vector3(
          0.0015 + Math.random() * 0.002,
          0.001 + Math.random() * 0.002,
          0.0008 + Math.random() * 0.0015
        ),
      });
    }

    const pointer = new THREE.Vector2();
    const onMouseMove = (event: MouseEvent) => {
      const bounds = container.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let animationFrame = 0;
    let isAnimating = !document.hidden;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isAnimating) return;

      const elapsed = clock.getElapsedTime();
      camera.position.x += (pointer.x * 0.28 - camera.position.x) * 0.025;
      camera.position.y += (-pointer.y * 0.18 - camera.position.y) * 0.025;
      camera.lookAt(0, 0, 0);

      floatingObjects.forEach(({ mesh, basePosition, driftOffset, rotationSpeed }) => {
        mesh.position.x = basePosition.x + Math.sin(elapsed * 0.28 + driftOffset) * 0.16;
        mesh.position.y = basePosition.y + Math.cos(elapsed * 0.35 + driftOffset) * 0.18;
        mesh.rotation.x += rotationSpeed.x;
        mesh.rotation.y += rotationSpeed.y;
        mesh.rotation.z += rotationSpeed.z;
      });

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const onVisibilityChange = () => {
      isAnimating = !document.hidden;
      if (isAnimating) {
        clock.start();
        animationFrame = window.requestAnimationFrame(animate);
      } else {
        window.cancelAnimationFrame(animationFrame);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    if (isAnimating) {
      animationFrame = window.requestAnimationFrame(animate);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver.disconnect();

      floatingObjects.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
        scene.remove(mesh);
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" />;
}