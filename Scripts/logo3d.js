// 3D version of the corner logo (images/3d-logo.glb). It turns slightly toward the mouse.
// The flat logo stays visible until the model has loaded, and remains if WebGL or loading fails.
const MODEL_URL = 'images/3d-logo.glb';
const DRACO_URL = 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/libs/draco/gltf/';
const MAX_TURN = 0.35; // radians left/right
const MAX_TILT = 0.22; // radians up/down

const slot = document.querySelector('.site-logo-slot');
const canvas = slot?.querySelector('.site-logo-canvas');

const webglAvailable = () => {
  try {
    const test = document.createElement('canvas');
    return Boolean(test.getContext('webgl2') || test.getContext('webgl'));
  } catch (err) {
    return false;
  }
};

// Phones and tablets keep the flat logo image, so nothing heavy is loaded there.
const smallOrTouchScreen = window.matchMedia('(max-width: 900px), (hover: none), (pointer: coarse)').matches;

const start = async () => {
  if (!slot || !canvas || smallOrTouchScreen || !webglAvailable()) return;
  const THREE = await import('three');
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  // Render at a higher resolution than the screen (it is a small canvas) for crisp edges.
  renderer.setPixelRatio(Math.min((window.devicePixelRatio || 1) * 1.5, 3));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  // A dark studio with a few light strips, so the chrome reads with strong contrast on the light page.
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0x0d0d0d);
  const strip = (w, h, x, y, z, ry = 0) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 0, 0);
    mesh.rotateZ(ry);
    studio.add(mesh);
  };
  strip(10, 1.2, 0, 6, 4);
  strip(1.4, 8, -7, 1, 3);
  strip(1, 6, 7, -1, 5, 0.3);
  strip(12, 0.6, 0, -5, 6);
  scene.environment = pmrem.fromScene(studio, 0.02).texture;

  const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 100);

  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_URL);
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  const gltf = await loader.loadAsync(MODEL_URL);

  // Turn the model so its thinnest side points at the camera (its face looks at us), centred.
  const model = gltf.scene;
  const raw = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  if (raw.y < raw.x && raw.y < raw.z) model.rotation.x = Math.PI / 2;
  else if (raw.x < raw.y && raw.x < raw.z) model.rotation.y = Math.PI / 2;
  model.updateMatrixWorld(true);
  const pivot = new THREE.Group();
  pivot.add(model);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  scene.add(pivot);

  const resize = () => {
    const rect = slot.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Fit the logo's width (with a little margin for the tilt) into the view.
    const fitWidth = (size.x * 1.08) / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / camera.aspect;
    const fitHeight = (size.y * 1.1) / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.set(0, 0, Math.max(fitWidth, fitHeight) + size.z);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };

  const target = { x: 0, y: 0 };
  let frame = null;
  const render = () => {
    frame = null;
    pivot.rotation.y += (target.y - pivot.rotation.y) * 0.08;
    pivot.rotation.x += (target.x - pivot.rotation.x) * 0.08;
    renderer.render(scene, camera);
    const settling = Math.abs(target.y - pivot.rotation.y) > 0.0005 || Math.abs(target.x - pivot.rotation.x) > 0.0005;
    if (settling) frame = requestAnimationFrame(render);
  };
  const requestRender = () => {
    if (frame === null) frame = requestAnimationFrame(render);
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    window.addEventListener('pointermove', (event) => {
      const rect = slot.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / window.innerWidth;
      const dy = (event.clientY - (rect.top + rect.height / 2)) / window.innerHeight;
      target.y = THREE.MathUtils.clamp(dx * 1.4, -1, 1) * MAX_TURN;
      target.x = THREE.MathUtils.clamp(dy * 1.4, -1, 1) * MAX_TILT;
      requestRender();
    }, { passive: true });
  }

  window.addEventListener('resize', () => {
    resize();
    requestRender();
  });

  resize();
  renderer.render(scene, camera);
  slot.classList.add('has-3d-logo');
};

const begin = () => start().catch((err) => {
  // Keep the flat logo when something goes wrong.
  console.warn('3D logo not available:', err);
});

// Load after the page itself, so the 3D logo never slows down the content.
if (document.readyState === 'complete') {
  ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(begin);
} else {
  window.addEventListener('load', () => ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(begin));
}
