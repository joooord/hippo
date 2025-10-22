import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Error handling
window.addEventListener('error', (e) => {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = `Error: ${e.message}\n${e.filename}:${e.lineno}`;
    }
    console.error('Error:', e);
});

window.addEventListener('unhandledrejection', (e) => {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = `Unhandled Promise Rejection: ${e.reason}`;
    }
    console.error('Unhandled rejection:', e);
});

try {
    // Create the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Create a camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create a WebGL renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Add orbit controls for mouse interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = false;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00ff00, 1, 100);
    pointLight.position.set(-5, 3, -5);
    scene.add(pointLight);

    // Create a colorful interactive cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({
        color: 0xff6b6b,
        shininess: 100,
        specular: 0x444444
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add edges to the cube for better visibility
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
    cube.add(line);

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Hide loading message
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Slight rotation for visual effect
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;

        controls.update();
        renderer.render(scene, camera);
    }

    animate();
} catch (error) {
    console.error('Fatal error:', error);
    const errorDiv = document.getElementById('error');
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) loadingDiv.style.display = 'none';
    if (errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = `Fatal Error: ${error.message}\n${error.stack}`;
    }
}
