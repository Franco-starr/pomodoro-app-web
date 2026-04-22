import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function loadTV(scene, crtMaterial) {

  const loader = new GLTFLoader();

  loader.load('/model/tv/scene.gltf', (gltf) => {
    const model = gltf.scene;

    model.scale.set(0.4, 0.4, 0.4);

    model.traverse((child) => {
      if (child.isMesh) {
        console.log(child.name);

        if (child.name.toLowerCase().includes('screen')) {
          child.material = crtMaterial;
        }
      }
    });

    scene.add(model);
  });
}
