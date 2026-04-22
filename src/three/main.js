import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { scene } from './scene.js';
import { camera } from './camera.js';
import { renderer } from './renderer.js';
import { setupLights, tvLight } from './lights.js';
import { createFloor } from './floor.js';
import { loadTV } from './tv.js';
import { createVideo } from './video.js';
import { getAverageColor } from './colorAnalyzer.js';
import { createCRTMaterial } from './crtShader.js';
import { startAnimation } from './animate.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;   // ❌ no mover lateralmente
controls.minPolarAngle = Math.PI / 3; // límite abajo
controls.maxPolarAngle = Math.PI / 2; // límite arriba
controls.minAzimuthAngle = -Math.PI / 6;
controls.maxAzimuthAngle = Math.PI / 6;

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.78;
controls.maxDistance = 3;
controls.target.set(0, 0.65, 0);
// luces
setupLights(scene);

// piso
const floor = createFloor();
scene.add(floor);

// video
const { video, videoTexture } = createVideo();

// shader CRT
const crtMaterial = createCRTMaterial(videoTexture);

// TV
loadTV(scene, crtMaterial);

// animación
startAnimation({
  scene,
  camera,
  controls,
  renderer,
  tvLight,
  video,
  getAverageColor,
  crtMaterial
});