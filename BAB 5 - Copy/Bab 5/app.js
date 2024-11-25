import * as THREE from './module/three.module.js'; // Mengimpor modul Three.js

main(); // Memanggil fungsi utama

function main() {
    // --------------------
    // PART 1: INISIALISASI
    // --------------------

    // Buat konteks
    const canvas = document.querySelector("#c"); // Mengambil elemen canvas
    const gl = new THREE.WebGLRenderer({
        canvas,
        antialias: true // Mengaktifkan antialiasing untuk tampilan lebih halus
    });

    // Buat kamera
    const angleOfView = 55; // Sudut pandang kamera
    const aspectRatio = canvas.clientWidth / canvas.clientHeight; // Rasio aspek
    const nearPlane = 0.1; // Bidang dekat
    const farPlane = 100; // Bidang jauh
    const camera = new THREE.PerspectiveCamera(
        angleOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    camera.position.set(0, 5, 25); // Posisi kamera

    // Buat scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0.68, 0.85, 0.9); // Warna latar belakang biru muda
    const fog = new THREE.Fog("lightgrey", 1, 100); // Mengatur kabut
    scene.fog = fog; // Menambahkan kabut ke scene

    // --------------------
    // PART 2: GEOMETRI DAN MATERIAL
    // --------------------

    // GEOMETRY
    // Buat kubus
    const cubeSize = 4; // Ukuran kubus
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    // Buat bola
    const sphereRadius = 3; // Jari-jari bola
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 16);

    // Buat bidang
    const planeWidth = 256; // Lebar bidang
    const planeHeight = 256; // Tinggi bidang
    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    // MATERIALS
    const textureLoader = new THREE.TextureLoader(); // Memuat tekstur

    // Material kubus dengan tekstur
    const cubeTextureMap = textureLoader.load('image/box.jpeg'); // Ganti dengan jalur ke tekstur kubus
    const cubeMaterial = new THREE.MeshStandardMaterial({
        map: cubeTextureMap // Menambahkan tekstur ke kubus
    });

    // Material bola dengan normal map
    const sphereNormalMap = textureLoader.load('image/bola.jpeg'); // Memuat normal map
    sphereNormalMap.wrapS = THREE.RepeatWrapping; // Mengatur pembungkusan
    sphereNormalMap.wrapT = THREE.RepeatWrapping; // Mengatur pembungkusan
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 'white', // Mengubah warna bola
        normalMap: sphereNormalMap // Menambahkan normal map
    });

    // Material bidang dengan tekstur dan normal map
    const planeTextureMap = textureLoader.load('image/bg.jpeg'); // Memuat tekstur bidang
    planeTextureMap.wrapS = THREE.RepeatWrapping; // Mengatur pembungkusan
    planeTextureMap.wrapT = THREE.RepeatWrapping; // Mengatur pembungkusan
    planeTextureMap.repeat.set(16, 16); // Mengatur pengulangan
    const planeNorm = textureLoader.load('image/normal-map.jpg'); // Memuat normal map untuk bidang
    planeNorm.wrapS = THREE.RepeatWrapping; // Mengatur pembungkusan
    planeNorm.wrapT = THREE.RepeatWrapping; // Mengatur pembungkusan
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: planeTextureMap, // Menambahkan tekstur
        side: THREE.DoubleSide, // Mengatur kedua sisi
        normalMap: planeNorm // Menambahkan normal map
    });

    // MESHES
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial); // Menggabungkan geometris dan material
    cube.position.set(7, 5, 10); // Posisi kubus
    scene.add(cube); // Menambahkan kubus ke scene

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial); // Menggabungkan geometris dan material untuk bola
    sphere.position.set(-sphereRadius - 3, 5, 10); // Posisi bola
    scene.add(sphere); // Menambahkan bola ke scene

    const plane = new THREE.Mesh(planeGeometry, planeMaterial); // Menggabungkan geometris dan material untuk bidang
    plane.rotation.x = -Math.PI / 2; // Memutar bidang 90 derajat
    scene.add(plane); // Menambahkan bidang ke scene

    // --------------------
    // PART 3: EFEK SALJU
    // --------------------

    // Snowfall variables
    const snowflakeCount = 1000; // Jumlah partikel salju
    const snowflakeGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(snowflakeCount * 3); // 3 koordinat per partikel

    // Generate random positions for snowflakes
    for (let i = 0; i < snowflakeCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200; // X
        positions[i * 3 + 1] = Math.random() * 100; // Y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200; // Z
    }

    snowflakeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const snowflakeMaterial = new THREE.PointsMaterial({
        color: 0xffffff, // Warna putih untuk salju
        size: 0.5, // Ukuran partikel
        transparent: true,
        opacity: 0.8
    });

    const snowflakes = new THREE.Points(snowflakeGeometry, snowflakeMaterial);
    scene.add(snowflakes); // Menambahkan partikel salju ke scene

    // --------------------
    // PART 4: ANIMASI DAN RENDER
    // --------------------

    // LIGHTS
    const color = 0xF5F5DC; // Warna cahaya putih tulang
    const intensity = 1; // Mengubah intensitas cahaya
    const light = new THREE.DirectionalLight(color, intensity); // Membuat cahaya arah
    light.position.set(5, 30, 30); // Mengubah posisi cahaya
    scene.add(light); // Menambahkan cahaya ke scene

    const ambientColor = 0xF5F5DC; // Warna cahaya ambient putih tulang
    const ambientIntensity = 0.3; // Mengubah intensitas cahaya ambient
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity); // Membuat cahaya ambient
    scene.add(ambientLight); // Menambahkan cahaya ambient ke scene

    // DRAW
    function draw(time) {
        time *= 0.001; // Mengubah waktu menjadi detik

        if (resizeGLToDisplaySize(gl)) {
            const canvas = gl.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        // Rotasi kubus
        cube.rotation.y += 0.02;

        // Rotasi bola
        sphere.rotation.x += 0.02;
        sphere.rotation.y += 0.02;

        // Update posisi salju untuk efek rotasi
        const positions = snowflakeGeometry.attributes.position.array;
        for (let i = 0; i < snowflakeCount; i++) {
            const x = i * 3;
            const y = i * 3 + 1;
            const z = i * 3 + 2;

            // Mengubah posisi Y (turun) dan sedikit bergoyang menggunakan sinus
            positions[y] -= 0.1; // Turunkan posisi Y setiap frame untuk efek jatuh
            positions[x] += Math.sin(time + i) * 0.05; // Bergoyang di sumbu X
            positions[z] += Math.cos(time + i) * 0.05; // Bergoyang di sumbu Z

            // Reset posisi salju jika keluar dari jangkauan (di bawah layar)
            if (positions[y] < -10) {
                positions[y] = 100;
            }
        }

        snowflakeGeometry.attributes.position.needsUpdate = true; // Tandai posisi sebagai diperbarui

        gl.render(scene, camera);
        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}

// Fungsi untuk mengubah ukuran canvas agar sesuai layar
function resizeGLToDisplaySize(gl) {
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        gl.setSize(width, height, false);
    }
    return needResize;
}
