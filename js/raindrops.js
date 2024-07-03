// Setup scene
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight); // Set renderer size to match window size
document.body.appendChild(renderer.domElement);

// Resize handling
window.addEventListener("resize", function () {
  let width = window.innerWidth;
  let height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

// Camera positioning
camera.position.set(0, 0, 40);

let textureLoader = new THREE.TextureLoader();
let texture = textureLoader.load('./images/night.jpg', function() {
    render();
});

scene.add(texture);

// Raindrop geometry
let raindropGeometry = new THREE.BufferGeometry();
let positions = [];
for (let i = 0; i < 1000; i++) {
  let x = Math.random() * 100 - 50; // x
  let y = Math.random() * 40 - 20; // y
  let z = Math.random() * 40 - 20; // z
  positions.push(x, y, z);
}
raindropGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3)
);

// Raindrop material
let raindropMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.05,
});

// Create raindrops
let raindrops = new THREE.Points(raindropGeometry, raindropMaterial);
scene.add(raindrops);

// Lightning parameters
let lightningIntensity = 0;
let lightningFrequency = 0.05; // Adjust to control frequency of lightning flashes

// Lightning effect
let lightningMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
let lightningGeometry = new THREE.PlaneGeometry(100, 100);
let lightning = new THREE.Mesh(lightningGeometry, lightningMaterial);
lightning.position.z = 20;
lightning.visible = false;
scene.add(lightning);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Move raindrops
  let positions = raindropGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 1] -= 0.1; // Move raindrop down
    if (positions[i + 1] < -20) {
      positions[i + 1] = 20; // Reset raindrop position
    }
  }
  raindropGeometry.attributes.position.needsUpdate = true;

  // Randomly trigger lightning
  if (Math.random() < lightningFrequency) {
    lightningFlash();
  }

  // Render scene
  renderer.render(scene, camera);
}
animate();

// Function to simulate lightning flash
function lightningFlash() {
  lightning.visible = true;
  lightningIntensity = 0.00001;

  setTimeout(() => {
    lightning.visible = false;
    createLightning(scene);
  }, Math.random());
}

function createLightning(scene) {
  // Create a curve for the lightning
  const points = [];
  const numPoints = 10; // Number of points for the lightning path
  const origin = new THREE.Vector3(0, 0, 0);
  points.push(origin.clone());

  // Generate random points for the lightning path
  for (let i = 0; i < numPoints; i++) {
    let point = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(75), // X coordinate
      THREE.MathUtils.randFloatSpread(50), // Y coordinate
      i * 6 // Z coordinate, increasing to make the lightning go upward
    );
    points.push(point);
  }

  // Create a THREE.js curve object
  const curve = new THREE.CatmullRomCurve3(points);

  // Create the geometry for the lightning line
  const pointsGeometry = new THREE.BufferGeometry().setFromPoints(
    curve.getPoints(numPoints)
  );

  // Create the material for the lightning line
  const material = new THREE.LineBasicMaterial({
    linewidth: Math.random() * 3 - 1,
    color: 0xffffff,
    transparent: true,
    opacity: 0.25,
    fog: true,
    linecap: "round", //ignored by WebGLRenderer
    linejoin: "round", //ignored by WebGLRenderer
  });

  // Create the line object and add it to the scene
  const lightningLine = new THREE.Line(pointsGeometry, material);
  scene.add(lightningLine);

  // Animation function to fade out the lightning line
  function animateFadeOut() {
    requestAnimationFrame(animateFadeOut);

    // Reduce opacity over time
    material.opacity -= 0.01; // Adjust the fading speed here

    // Remove the lightning line when opacity is low
    if (material.opacity <= 0) {
      scene.remove(lightningLine);
    }

    // Render the scene
    renderer.render(scene, camera);
  }

  // Start fading out after 500 milliseconds
  setTimeout(() => {
    animateFadeOut();
  }, Math.random());

  return lightningLine; // Return the lightning line object
}
