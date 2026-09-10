import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export interface SceneController {
  select: (index: number) => void;
  setExploded: (expanded: boolean) => void;
  pause: (paused: boolean) => void;
  rotate: (direction: number) => void;
  reset: () => void;
  dispose: () => void;
}

export function createSystemScene(
  host: HTMLElement,
  onSelect: (index: number) => void,
  onFailure: () => void,
  initiallyPaused: boolean,
): SceneController {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1 : 1.5),
  );
  renderer.setClearColor(0x111216, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const environmentGenerator = new THREE.PMREMGenerator(renderer);
  const studio = new RoomEnvironment();
  const environment = environmentGenerator.fromScene(studio, 0.04);
  scene.environment = environment.texture;
  studio.dispose();
  environmentGenerator.dispose();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
  camera.position.set(0, 1.2, 10.8);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = false;
  controls.rotateSpeed = 0.45;
  controls.minPolarAngle = 0.5;
  controls.maxPolarAngle = 2.4;
  controls.touches.ONE = THREE.TOUCH.PAN;
  controls.touches.TWO = THREE.TOUCH.ROTATE;
  controls.update();
  controls.saveState();
  renderer.domElement.style.touchAction = "pan-y";
  scene.add(new THREE.HemisphereLight(0xe3efff, 0x322b31, 1.5));
  const light = new THREE.DirectionalLight(0xd5f9ef, 4);
  light.position.set(3, 5, 4);
  scene.add(light);
  const rim = new THREE.DirectionalLight(0xf0c4b5, 3);
  rim.position.set(-4, 1, 2);
  scene.add(rim);
  const tilt = new THREE.Group();
  const sculpture = new THREE.Group();
  sculpture.rotation.set(0.3, -0.45, -0.25);
  tilt.add(sculpture);
  scene.add(tilt);
  const geometry = new THREE.TorusGeometry(1.45, 0.39, 32, 120);
  const colors = [0xc4e6df, 0xb3c5df, 0xe6c6bd];
  const rings = colors.map((color, index) => {
    const material = new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.94,
      roughness: 0.17,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.8,
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.set(
      (index * Math.PI) / 3,
      (index * Math.PI) / 3,
      index * 0.3,
    );
    ring.userData.layer = index;
    sculpture.add(ring);
    return ring;
  });
  let paused = initiallyPaused;
  let visible = true;
  let disposed = false;
  let dragging = false;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let expanded = true;
  let expansion = 1;
  const targetTilt = new THREE.Vector2();
  const pointer = new THREE.Vector2();
  const pointerDownPosition = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const hero = host.closest<HTMLElement>(".hero") ?? host;

  function draw() {
    if (!disposed && visible && !document.hidden)
      renderer.render(scene, camera);
  }
  function updateAssembly() {
    rings.forEach((ring, index) => {
      ring.position.set(
        (index - 1) * expansion * 0.42,
        (index - 1) * expansion * 0.12,
        0,
      );
    });
  }
  function animate(time: number) {
    frame = 0;
    if (paused || !visible || disposed || document.hidden) return;
    if (time - lastTime >= 1000 / 30) {
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      elapsed += delta;
      lastTime = time;
      expansion = THREE.MathUtils.damp(expansion, expanded ? 1 : 0, 7, delta);
      updateAssembly();
      if (!dragging) sculpture.rotation.y += delta * 0.09;
      sculpture.position.y = Math.sin(elapsed * 0.7) * 0.12;
      tilt.rotation.x = THREE.MathUtils.damp(
        tilt.rotation.x,
        targetTilt.y * 0.18,
        4,
        delta,
      );
      tilt.rotation.z = THREE.MathUtils.damp(
        tilt.rotation.z,
        targetTilt.x * -0.16,
        4,
        delta,
      );
      draw();
    }
    frame = requestAnimationFrame(animate);
  }
  function restart() {
    cancelAnimationFrame(frame);
    draw();
    if (!paused && visible && !document.hidden && !disposed) {
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    }
  }
  function select(index: number) {
    rings.forEach((ring, ringIndex) => {
      ring.material.color.setHex(colors[ringIndex]);
      ring.material.emissive.setHex(colors[ringIndex]);
      ring.material.emissiveIntensity = ringIndex === index ? 0.12 : 0;
    });
    draw();
  }
  function setExploded(value: boolean) {
    expanded = value;
    if (paused) {
      expansion = value ? 1 : 0;
      updateAssembly();
    }
    draw();
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.fov = camera.aspect < 1 ? 46 : 36;
    camera.updateProjectionMatrix();
    draw();
  }
  function pointerMove(event: PointerEvent) {
    if (paused || dragging || event.pointerType !== "mouse") return;
    const bounds = hero.getBoundingClientRect();
    targetTilt.set(
      THREE.MathUtils.clamp(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -1,
        1,
      ),
      THREE.MathUtils.clamp(
        ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
        -1,
        1,
      ),
    );
  }
  function pointerLeave() {
    targetTilt.set(0, 0);
  }
  function pointerDown(event: PointerEvent) {
    dragging = true;
    pointerDownPosition.set(event.clientX, event.clientY);
  }
  function pointerCancel() {
    dragging = false;
  }
  function pointerUp(event: PointerEvent) {
    dragging = false;
    if (
      pointerDownPosition.distanceTo(
        new THREE.Vector2(event.clientX, event.clientY),
      ) > 5
    )
      return;
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(rings)[0];
    if (hit) onSelect(hit.object.userData.layer as number);
  }
  function contextLost(event: Event) {
    event.preventDefault();
    paused = true;
    cancelAnimationFrame(frame);
    onFailure();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      hero.style.setProperty("--ambient-state", visible ? "running" : "paused");
      restart();
    },
    { threshold: 0.01 },
  );
  intersectionObserver.observe(host);
  hero.addEventListener("pointermove", pointerMove);
  hero.addEventListener("pointerleave", pointerLeave);
  renderer.domElement.addEventListener("pointerdown", pointerDown);
  renderer.domElement.addEventListener("pointerup", pointerUp);
  renderer.domElement.addEventListener("pointercancel", pointerCancel);
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  controls.addEventListener("change", draw);
  document.addEventListener("visibilitychange", restart);
  updateAssembly();
  select(0);
  resize();
  restart();
  return {
    select,
    setExploded,
    pause(value) {
      paused = value;
      hero.dataset.motion = value ? "paused" : "running";
      if (paused) {
        expansion = expanded ? 1 : 0;
        updateAssembly();
        targetTilt.set(0, 0);
      }
      restart();
    },
    rotate(direction) {
      sculpture.rotation.y += (direction * Math.PI) / 8;
      draw();
    },
    reset() {
      sculpture.rotation.set(0.3, -0.45, -0.25);
      sculpture.position.y = 0;
      tilt.rotation.set(0, 0, 0);
      targetTilt.set(0, 0);
      controls.reset();
      setExploded(true);
      select(0);
      onSelect(0);
      draw();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      hero.removeEventListener("pointermove", pointerMove);
      hero.removeEventListener("pointerleave", pointerLeave);
      hero.style.removeProperty("--ambient-state");
      delete hero.dataset.motion;
      document.removeEventListener("visibilitychange", restart);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerCancel);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      controls.dispose();
      geometry.dispose();
      rings.forEach((ring) => ring.material.dispose());
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
