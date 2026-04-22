import * as THREE from 'three';

export function startAnimation({
  scene,
  camera,
  controls,
  renderer,
  tvLight,
  video,
  getAverageColor,
  crtMaterial
}) {

  const clock = new THREE.Clock();
  // const basePosition = camera.position.clone();

  let lastTime = 0;
  const fpsLimit = 60;
  const frameDelay = 1000 / fpsLimit;

  function animate(now = 0) {

    requestAnimationFrame(animate);

    if (now - lastTime < frameDelay) return;
    lastTime = now;

    const time = now * 0.001;

    crtMaterial.uniforms.time.value = time;

    if (Math.floor(time * 60) % 5 === 0) {
      const avg = getAverageColor(video);

      tvLight.color.setRGB(avg.r, avg.g, avg.b);
      tvLight.intensity = 10.0 * (avg.r + avg.g + avg.b);
    }

    const t = clock.getElapsedTime();

    // Cámara shake (deshabilitado para no interferir con OrbitControls)
    // camera.position.x = basePosition.x + Math.sin(t * 0.6) * 0.015;
    // camera.position.y = basePosition.y + Math.cos(t * 0.8) * 0.015;
    // camera.rotation.z = Math.sin(t * 0.5) * 0.0008;

    controls.update();

    renderer.render(scene, camera);
  }

  animate();
}