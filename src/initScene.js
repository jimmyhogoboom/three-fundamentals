import * as THREE from 'three';

function directionalLight() {
  const color = 0xFFFFFF;
  const intensity = 3;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);

  return light;
}

function fillLight() {
  const fillLight1 = new THREE.HemisphereLight( 0x8dc1de, 0x00668d, 1.5 );
  fillLight1.position.set( 2, 1, 1 );

  return fillLight1;
}

export default function initScene() {
  const scene = new THREE.Scene();

  // TODO: make this come from a nearby star
  const light = directionalLight();
  scene.add(light);

  const lightFill = fillLight();
  scene.add(lightFill);

  return scene;
}
