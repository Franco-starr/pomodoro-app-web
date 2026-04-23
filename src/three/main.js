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
controls.enablePan = false;
controls.minPolarAngle = Math.PI / 3;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = -Math.PI / 6;
controls.maxAzimuthAngle = Math.PI / 6;

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.78;
controls.maxDistance = 3;
controls.target.set(0, 0.65, 0);

setupLights(scene);

const floor = createFloor();
scene.add(floor);

const { video, videoTexture } = await createVideo();

const crtMaterial = createCRTMaterial(videoTexture);

loadTV(scene, crtMaterial);

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