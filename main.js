import * as THREE from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';

import initScene from './src/initScene.js';

const boxGeometry = (width = 1, height = 1, depth = 1) => {
  return new THREE.BoxGeometry(width, height, depth)
}

const coneGeometry = ({
  radius = 1,
  height = 1,
  radialSegments = 16,
  heightSegments = 4,
  openEnded = false,
  thetaStart = Math.PI * 0.18,
  thetaLength = Math.PI
} = {}) => {
  return new THREE.ConeGeometry(radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
};

const sphereGeometry = (radius = 1, widthSegments = 30, heightSegments = 30) => {
  return new THREE.SphereGeometry(radius, widthSegments, heightSegments);
}

function makeMesh(geometry, color) {
  const material = new THREE.MeshPhongMaterial({ color, side: THREE.TwoPassDoubleSide });
  return new THREE.Mesh(geometry, material);
}

function renderScene(renderer, scene, camera) {
  renderer.render(scene, camera);
}

function resizeCameraAspectToDisplaySize(canvas, camera) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  return needResize;
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = canvas.clientWidth * pixelRatio | 0;
  const height = canvas.clientHeight * pixelRatio | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

const cubeOfColorAt = (c, { x, y, z }) => {
  const cube = makeMesh(boxGeometry(), c);
  cube.position.x = x;
  cube.position.y = y;
  cube.position.z = z;

  return cube;
};

const coneOfColorAt = (c, { x, y, z }) => {
  const cone = makeMesh(coneGeometry(), c);

  cone.position.x = x;
  cone.position.y = y;
  cone.position.z = z;

  return cone;
}

const sphereOfColorAt = (c, { x, y, z }) => {
  const sphere = makeMesh(sphereGeometry(), c);
  sphere.position.x = x;
  sphere.position.y = y;
  sphere.position.z = z;

  return sphere;
};

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 5000;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.rotation.order = 'YXZ';

  const playerSpeed = 0.25;
  const playerBoostSpeed = 0.95;
  let boosting = false;

  // TODO: a ship
  const playerCollider = new Capsule(
    new THREE.Vector3(0, 0.35, 0),
    new THREE.Vector3(0, 1, 0),
    0.35
  );

  const playerVelocity = new THREE.Vector3();
  const playerDirection = new THREE.Vector3();
  const initial = new THREE.Vector3();

  let mouseTime = 0;

  const keyStates = {};

  document.addEventListener('keydown', (event) => {
    keyStates[event.code] = true;
  });

  document.addEventListener('keyup', (event) => {
    keyStates[event.code] = false;
  });

  canvas.addEventListener('mousedown', () => {
    document.body.requestPointerLock();

    mouseTime = performance.now();
  });

  document.addEventListener('mouseup', () => {
    if (document.pointerLockElement !== null) { /* do something on click */ }
  });

  document.body.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body) {
      camera.rotation.y -= event.movementX / 500;
      camera.rotation.x -= event.movementY / 500;
    }
  });

  function updatePlayer(deltaTime) {

    let damping = Math.exp(- 4 * deltaTime) - 1;

    // TODO: make togglable by player
    // slow to a stop
    damping *= 0.01;
    playerVelocity.addScaledVector(playerVelocity, damping);

    // TODO: drag player slowly towards planets
    // playerVelocity.y -= GRAVITY * deltaTime;

    const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
    playerCollider.translate(deltaPosition);

    // TODO: implement
    // playerCollisions();

    camera.position.copy(playerCollider.end);
  }

  function getForwardVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.normalize();

    return playerDirection;
  }

  function getSideVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.normalize();
    playerDirection.cross(camera.up);

    return playerDirection;
  }

  function getVerticalVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.normalize();
    initial.copy(playerDirection);
    playerDirection.cross(camera.up);
    playerDirection.cross(initial);

    return playerDirection;
  }

  function controls(deltaTime) {
    // gives a bit of air control
    // const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

    boosting = false;
    if (keyStates['ShiftLeft']) {
      boosting = true;
    }

    // TODO: modify by walking speed or based on vehicle thrust level
    const speedDelta = deltaTime * (boosting ? playerBoostSpeed : playerSpeed); // * 25;

    if (keyStates['KeyW']) {
      playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
    }

    if (keyStates['KeyS']) {
      playerVelocity.add(getForwardVector().multiplyScalar(- speedDelta));
    }

    if (keyStates['KeyA']) {
      playerVelocity.add(getSideVector().multiplyScalar(- speedDelta));
    }

    if (keyStates['KeyD']) {
      playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
    }

    if (keyStates['Space']) {
      playerVelocity.add(getVerticalVector().multiplyScalar(speedDelta));
    }

    if (keyStates['KeyC']) {
      playerVelocity.add(getVerticalVector().multiplyScalar(- speedDelta));
    }
  }

  const clock = new THREE.Clock();

  const scene = initScene();

  const meshDefs = [
    coneOfColorAt(0x44aa88, { x: 0, y: 0, z: -1 }),
    sphereOfColorAt(0x8844aa, { x: -2, y: -2, z: -2 }),
    cubeOfColorAt(0xaa8844, { x: 2, y: 2, z: -2 }),
  ];

  const meshes = meshDefs.map((mesh, i) => {
    return mesh;
  });

  meshes.forEach(cube => scene.add(cube));

  const ops = [
    function rotatingCubes({ timeSeconds: t }) {
      meshes.forEach((cube, i) => {
        const speed = .0001 + i * .1;
        const rotation = t * speed;
        cube.rotation.x = rotation;
        cube.rotation.y = rotation;
      });
    },
  ];

  let count = 0;

  // Begin rendering loop
  const STEPS_PER_FRAME = 5;

  // TODO: combine animate and render
  function animate() {
    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

    // we look for collisions in substeps to mitigate the risk of
    // an object traversing another too quickly for detection.
    for (let i = 0; i < STEPS_PER_FRAME; i++) {

      controls(deltaTime);

      updatePlayer(deltaTime);

      // updateSpheres(deltaTime);

      // teleportPlayerIfOob();
    }

    // stats.update();
  }

  // TODO: combine animate and render
  const render = time => {
    const timeSeconds = time * 0.001;

    resizeCameraAspectToDisplaySize(canvas, camera);

    resizeRendererToDisplaySize(renderer);

    animate();

    ops.map(op => op({ time, timeSeconds }));

    renderScene(renderer, scene, camera);

    requestAnimationFrame(render);

    count++;

    let fps = count / timeSeconds;

    // if (count % 20 === 0 )
    //   console.log(count, time, fps)
  }

  requestAnimationFrame(render);
}

main();
