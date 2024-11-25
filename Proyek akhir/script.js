const video = document.getElementById('video');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

// Inisialisasi Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Muat semua model 3D huruf A-Z
const loader = new THREE.GLTFLoader();
const models = {};
for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    loader.load(`assets/${letter}.gltf`, (gltf) => {
        models[letter] = gltf.scene;
        scene.add(gltf.scene);
        gltf.scene.visible = false; // Sembunyikan semua model awalnya
    });
}

// Fungsi untuk mendeteksi barcode
function detectBarcode() {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData, {
        inversionAttempts: 'none'
    });

    if (code) {
        const barcodeData = code.data;
        console.log('Barcode Data:', barcodeData);

        // Tampilkan model 3D sesuai dengan data barcode
        const letterModel = models[barcodeData];
        if (letterModel) {
            letterModel.visible = true;
            // Posisikan model 3D di tengah scene
            letterModel.position.set(0, 0, -5);
        }
    }
}

// Fungsi untuk menggambar video ke canvas
function draw() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    detectBarcode();
    requestAnimationFrame(draw);
}

// Mulai video
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
    video.play();
    draw();
  })
  .catch(error => console.error('Error accessing media devices.', error));

// Render scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();