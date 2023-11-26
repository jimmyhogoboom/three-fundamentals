import * as THREE from 'three';

const boxGeometry = (width = 1, height = 1, depth = 1) => {
  return new THREE.BoxGeometry(width, height, depth)
}

function cubeMesh() {
  const geometry = boxGeometry();

  const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });

  return new THREE.Mesh(geometry, material);
}

function makeMesh(geometry, color) {
  const material = new THREE.MeshPhongMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

function renderScene(renderer, scene, camera) {
  renderer.render(scene, camera);
}

function directionalLight() {
  const color = 0xFFFFFF;
  const intensity = 3;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);

  return light;
}

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 5;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  // TODO: move this according to player input
  camera.position.z = 2;

  const scene = new THREE.Scene();

  const cubeOfColorAt = (c, {x}) => {
    const cube = makeMesh(boxGeometry(), c);
    cube.position.x = x;

    return cube;
  };

  const cubeDefs = [
    { color: 0x44aa88, initialX: 0},
    { color: 0x8844aa, initialX: -2},
    { color: 0xaa8844, initialX: 2},
  ];

  const cubes = cubeDefs.map(def => {
    return cubeOfColorAt(def.color, { x: def.initialX });
  });

  cubes.forEach(cube => scene.add(cube));

  // TODO: make this come from a nearby star
  const light = directionalLight();

  scene.add(light);

  const ops = [
    function rotatingCubes({ timeSeconds: t }) {
      cubes.forEach((cube, i) => {
        const speed = 1 + i * .1;
        const rotation = t * speed;
        cube.rotation.x = rotation;
        cube.rotation.y = rotation;
      });
    },
  ];

  let count = 0;

  // Begin rendering loop
  let h = window.innerWidth;
  let w = window.innerHeight;

  const render = time => {
    const timeSeconds = time * 0.001;

    if (window.innerWidth != w) {
      canvas.width = window.innerWidth;
    }

    if (window.innerHeight != h) {
      canvas.height = window.innerHeight;
    }

    ops.map(op => op({ time, timeSeconds }));

    renderScene(renderer, scene, camera);

    requestAnimationFrame(render);

    count ++;

    let fps = count / timeSeconds;

    // if (count % 20 === 0 )
    //   console.log(count, time, fps)
  }

  requestAnimationFrame(render);
}

main();
