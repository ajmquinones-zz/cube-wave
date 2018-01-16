const DEG2RAD = 0.017453292519943295;
let container;
let camera;
let controls;
let scene;
let frustumSize = 600;
let width = 20;
let height = 280;
let radius = 500;
let theta = 0;
let objects = [];

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000);
  camera.position.x = radius * Math.sin(Math.PI / 4);
  camera.position.y = radius * Math.cos(Math.PI / 4);
  camera.position.z = radius * Math.sin(-Math.PI / 4);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfaf9fa);

  camera.lookAt(scene.position);

  let light = new THREE.DirectionalLight(0x3c5486, 1);
  light.position.set(1, 0, 0).normalize();
  scene.add(light);

  light = new THREE.DirectionalLight(0xe8e0af, 1);
  light.position.set(0, 0, -1).normalize();
  scene.add(light);

  light = new THREE.DirectionalLight(0x7fb4b7, 1);
  light.position.set(0, 1, 0).normalize();
  scene.add(light);

  let geometry = new THREE.BoxBufferGeometry(width, height, width);

  for (let z = 0; z < 16; z++) {

    let row = [];
    for (let x = 0; x < 16; x++) {
      let object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: 0xffffff }));
      object.position.x = x * width;
      object.position.y = 0;
      object.position.z = z * width;

      object.scale.x = 1;
      object.scale.y = 1;
      object.scale.z = 1;


      scene.add(object);
      row.push(object);
    }

    objects.push(row);
  }

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', render); // remove when using animation loop
  // enable animation loop when using damping or autorotation
  //controls.enableDamping = true;
  //controls.dampingFactor = 0.25;
  controls.enableZoom = false;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
  render();
}

function mapRange(value, from1, to1, from2, to2) {
  return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
}

function wave(value, theta) {

  let result = Math.sin(DEG2RAD * value - theta);
  return result;
}

function sigmoid(t) {
  return 1 / (1 + Math.pow(Math.E, -t));
}

function render() {
  theta += 0.075;

  camera.updateMatrixWorld();

  renderer.render(scene, camera);

  objects.forEach((row, z) => row.forEach((object, x) => {
    // We chose 7.6/7,4 as the mid point so that the 4 blocks in the center
    // don't move as one but only slightly apart.
    let dz = 7.6 - z;
    let dx = 7.4 - x;
    let distance = Math.sqrt(dz * dz + dx * dx);

    // 11,32 = max distance (sqrt(8^2 + 8^2))
    let activated = mapRange(distance, 0, 11.32, -180, 180);

    // We use sigmoid to dampen the effects of the sine function in the 
    // center of the cube, making the resulting wave rounder but less
    // bouncier :(
    let eased = sigmoid(distance / 3);
    let scale = wave(activated, theta);

    // Square the easing factor so it becomes less damp at the edges
    scale *= (eased * eased * 1.25)

    // The minimum scaling for each block (20% of the maximum height)
    let minScale = 0.2;
    let oscillation = (1 - minScale) / 2;
    object.scale.y = minScale + oscillation + (oscillation * scale);
  }));
}

init();
animate();