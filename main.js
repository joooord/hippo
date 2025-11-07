import * as THREE from 'three';

// ==================== GAME STATE ====================
const gameState = {
    score: 0,
    fruits: 0,
    enemiesDefeated: 0,
    health: 100,
    gameOver: false,
    time: 0,
    terrainPhase: 0
};

const keys = {};
let mouseX = 0;
let mouseY = 0;

// ==================== SCENE SETUP ====================
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x228B22, 10, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ==================== LIGHTING ====================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffd700, 1.0);
sunLight.position.set(50, 50, 50);
sunLight.castShadow = true;
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

const greenLight = new THREE.PointLight(0x00ff00, 0.5, 30);
greenLight.position.set(0, 10, 0);
scene.add(greenLight);

// ==================== HIPPO CHARACTER ====================
function createHippo() {
    const hippo = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 1, 2);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x8B7355 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.position.y = 0.5;
    hippo.add(body);

    // Head
    const headGeometry = new THREE.BoxGeometry(1, 0.8, 1.2);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.castShadow = true;
    head.position.set(0, 0.7, 1.2);
    hippo.add(head);

    // Snout
    const snoutGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.6);
    const snout = new THREE.Mesh(snoutGeometry, bodyMaterial);
    snout.castShadow = true;
    snout.position.set(0, 0.6, 1.8);
    hippo.add(snout);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.9, 1.7);
    hippo.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 0.9, 1.7);
    hippo.add(rightEye);

    // Ears
    const earGeometry = new THREE.ConeGeometry(0.2, 0.3, 8);
    const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
    leftEar.rotation.z = Math.PI / 6;
    leftEar.position.set(-0.5, 1.2, 1.0);
    hippo.add(leftEar);
    const rightEar = new THREE.Mesh(earGeometry, bodyMaterial);
    rightEar.rotation.z = -Math.PI / 6;
    rightEar.position.set(0.5, 1.2, 1.0);
    hippo.add(rightEar);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x6B5345 });
    const legs = [
        [-0.5, 0.4, 0.6],
        [0.5, 0.4, 0.6],
        [-0.5, 0.4, -0.6],
        [0.5, 0.4, -0.6]
    ];
    legs.forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.castShadow = true;
        leg.position.set(x, y, z);
        hippo.add(leg);
    });

    // Tail
    const tailGeometry = new THREE.CylinderGeometry(0.1, 0.05, 0.8, 8);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.rotation.x = Math.PI / 3;
    tail.position.set(0, 0.8, -1.2);
    hippo.add(tail);

    hippo.position.set(0, 0, 0);
    return hippo;
}

const hippo = createHippo();
scene.add(hippo);

// ==================== TERRAIN ====================
function createTerrain() {
    const geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const material = new THREE.MeshPhongMaterial({
        color: 0x228B22,
        flatShading: true,
        side: THREE.DoubleSide
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;

    // Add some random height variation
    const vertices = geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
        const x = vertices.getX(i);
        const y = vertices.getY(i);
        const height = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2;
        vertices.setZ(i, height);
    }
    vertices.needsUpdate = true;
    geometry.computeVertexNormals();

    scene.add(terrain);
    return { mesh: terrain, geometry };
}

const terrain = createTerrain();

// ==================== TREES ====================
function createTree(x, z) {
    const tree = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x4B3621 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.castShadow = true;
    trunk.position.y = 1.5;
    tree.add(trunk);

    // Leaves - multiple spheres for foliage
    const leafMaterial = new THREE.MeshPhongMaterial({ color: 0x0F6B0F });
    for (let i = 0; i < 3; i++) {
        const leafGeometry = new THREE.SphereGeometry(1 + i * 0.3, 8, 8);
        const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
        leaves.castShadow = true;
        leaves.position.y = 2.5 + i * 0.5;
        tree.add(leaves);
    }

    tree.position.set(x, 0, z);
    return tree;
}

const trees = [];
for (let i = 0; i < 50; i++) {
    const x = (Math.random() - 0.5) * 150;
    const z = (Math.random() - 0.5) * 150;
    if (Math.abs(x) > 10 || Math.abs(z) > 10) {
        const tree = createTree(x, z);
        trees.push(tree);
        scene.add(tree);
    }
}

// ==================== FRUITS ====================
function createFruit(x, y, z) {
    const fruitTypes = [
        { color: 0xff0000, size: 0.3 }, // Apple
        { color: 0xffa500, size: 0.35 }, // Orange
        { color: 0xffff00, size: 0.25 }, // Banana
        { color: 0xff00ff, size: 0.28 }  // Berry
    ];
    const type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];

    const geometry = new THREE.SphereGeometry(type.size, 8, 8);
    const material = new THREE.MeshPhongMaterial({
        color: type.color,
        emissive: type.color,
        emissiveIntensity: 0.3
    });
    const fruit = new THREE.Mesh(geometry, material);
    fruit.position.set(x, y, z);
    fruit.castShadow = true;

    fruit.userData = {
        type: 'fruit',
        bobSpeed: Math.random() * 2 + 1,
        bobOffset: Math.random() * Math.PI * 2,
        rotSpeed: Math.random() * 0.05 + 0.02
    };

    return fruit;
}

const fruits = [];
function spawnFruit() {
    const x = (Math.random() - 0.5) * 80;
    const z = (Math.random() - 0.5) * 80;
    const fruit = createFruit(x, 1, z);
    fruits.push(fruit);
    scene.add(fruit);
}

// Initial fruits
for (let i = 0; i < 20; i++) {
    spawnFruit();
}

// ==================== ENEMIES ====================
function createEnemy(x, z) {
    const enemy = new THREE.Group();

    // Body - dark creature
    const bodyGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0x4B0082,
        emissive: 0x8B00FF,
        emissiveIntensity: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.position.y = 0.5;
    enemy.add(body);

    // Eyes - glowing red
    const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.8
    });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.7, 0.5);
    enemy.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.7, 0.5);
    enemy.add(rightEye);

    enemy.position.set(x, 0, z);
    enemy.userData = {
        type: 'enemy',
        health: 3,
        speed: 0.03 + Math.random() * 0.02,
        attackCooldown: 0
    };

    return enemy;
}

const enemies = [];
function spawnEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 20;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const enemy = createEnemy(x, z);
    enemies.push(enemy);
    scene.add(enemy);
}

// Initial enemies
for (let i = 0; i < 10; i++) {
    spawnEnemy();
}

// ==================== WATER PROJECTILES ====================
function createWaterShot(startPos, direction) {
    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshPhongMaterial({
        color: 0x00bfff,
        emissive: 0x00bfff,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
    });
    const water = new THREE.Mesh(geometry, material);
    water.position.copy(startPos);

    water.userData = {
        type: 'water',
        velocity: direction.multiplyScalar(0.5),
        life: 100
    };

    scene.add(water);
    return water;
}

const waterShots = [];

// ==================== CAMERA SETUP ====================
camera.position.set(0, 8, -12);
camera.lookAt(hippo.position);

// ==================== INPUT HANDLING ====================
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' && !gameState.gameOver) {
        shootWater();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
    if (!gameState.gameOver) {
        shootWater();
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==================== GAME FUNCTIONS ====================
function shootWater() {
    const direction = new THREE.Vector3();
    hippo.getWorldDirection(direction);
    direction.y = 0.1;
    direction.normalize();

    const startPos = hippo.position.clone();
    startPos.y += 1;
    startPos.add(direction.clone().multiplyScalar(1.5));

    const water = createWaterShot(startPos, direction);
    waterShots.push(water);
}

function updateHippo(delta) {
    if (gameState.gameOver) return;

    const moveSpeed = 0.15;
    const rotateSpeed = 0.08;

    // Movement
    const moveDirection = new THREE.Vector3();
    if (keys['w'] || keys['arrowup']) moveDirection.z += 1;
    if (keys['s'] || keys['arrowdown']) moveDirection.z -= 1;
    if (keys['a'] || keys['arrowleft']) moveDirection.x += 1;
    if (keys['d'] || keys['arrowright']) moveDirection.x -= 1;

    if (moveDirection.length() > 0) {
        moveDirection.normalize();

        // Rotate hippo to face movement direction
        const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
        hippo.rotation.y = THREE.MathUtils.lerp(hippo.rotation.y, targetRotation, rotateSpeed);

        // Move hippo
        const forward = new THREE.Vector3();
        hippo.getWorldDirection(forward);
        hippo.position.add(forward.multiplyScalar(moveSpeed));

        // Bobbing animation when moving
        hippo.position.y = Math.sin(gameState.time * 5) * 0.1;

        // Keep hippo in bounds
        hippo.position.x = Math.max(-90, Math.min(90, hippo.position.x));
        hippo.position.z = Math.max(-90, Math.min(90, hippo.position.z));
    }
}

function updateCamera() {
    // Third-person camera that follows hippo
    const cameraOffset = new THREE.Vector3(0, 8, -12);
    const targetPosition = hippo.position.clone().add(cameraOffset);
    camera.position.lerp(targetPosition, 0.1);

    const lookAtTarget = hippo.position.clone();
    lookAtTarget.y += 1;
    camera.lookAt(lookAtTarget);
}

function updateFruits(delta) {
    fruits.forEach((fruit, index) => {
        // Bobbing animation
        const time = gameState.time * fruit.userData.bobSpeed + fruit.userData.bobOffset;
        fruit.position.y = 1 + Math.sin(time) * 0.3;
        fruit.rotation.y += fruit.userData.rotSpeed;

        // Check collision with hippo
        const distance = fruit.position.distanceTo(hippo.position);
        if (distance < 1.5) {
            scene.remove(fruit);
            fruits.splice(index, 1);
            gameState.score += 10;
            gameState.fruits++;
            updateUI();
            spawnFruit(); // Spawn a new fruit
        }
    });
}

function updateEnemies(delta) {
    enemies.forEach((enemy, index) => {
        if (gameState.gameOver) return;

        // Move towards hippo
        const direction = new THREE.Vector3();
        direction.subVectors(hippo.position, enemy.position);
        direction.y = 0;
        direction.normalize();

        enemy.position.add(direction.multiplyScalar(enemy.userData.speed));

        // Rotate to face hippo
        const angle = Math.atan2(direction.x, direction.z);
        enemy.rotation.y = angle;

        // Bob animation
        enemy.position.y = Math.sin(gameState.time * 3 + index) * 0.2;

        // Attack hippo if close
        const distance = enemy.position.distanceTo(hippo.position);
        if (distance < 2) {
            enemy.userData.attackCooldown -= delta;
            if (enemy.userData.attackCooldown <= 0) {
                gameState.health -= 5;
                enemy.userData.attackCooldown = 1000; // 1 second cooldown
                updateUI();

                if (gameState.health <= 0) {
                    endGame();
                }
            }
        }
    });
}

function updateWaterShots(delta) {
    waterShots.forEach((water, index) => {
        // Move water shot
        water.position.add(water.userData.velocity);
        water.userData.life--;

        // Remove if expired
        if (water.userData.life <= 0) {
            scene.remove(water);
            waterShots.splice(index, 1);
            return;
        }

        // Check collision with enemies
        enemies.forEach((enemy, enemyIndex) => {
            const distance = water.position.distanceTo(enemy.position);
            if (distance < 1) {
                enemy.userData.health--;
                scene.remove(water);
                waterShots.splice(index, 1);

                if (enemy.userData.health <= 0) {
                    scene.remove(enemy);
                    enemies.splice(enemyIndex, 1);
                    gameState.score += 50;
                    gameState.enemiesDefeated++;
                    updateUI();

                    // Spawn new enemy
                    setTimeout(() => spawnEnemy(), 2000);
                }
            }
        });
    });
}

function updateTerrain() {
    // Dynamic terrain morphing
    const vertices = terrain.geometry.attributes.position;
    const phase = gameState.terrainPhase;

    for (let i = 0; i < vertices.count; i++) {
        const x = vertices.getX(i);
        const y = vertices.getY(i);

        const height = Math.sin(x * 0.1 + phase) * Math.cos(y * 0.1 + phase) * 2 +
                      Math.sin(x * 0.05 + phase * 0.5) * Math.cos(y * 0.05) * 1;

        vertices.setZ(i, height);
    }

    vertices.needsUpdate = true;
    terrain.geometry.computeVertexNormals();
}

function updateLighting() {
    // Slowly change lighting for atmosphere
    const time = gameState.time;
    sunLight.intensity = 0.8 + Math.sin(time * 0.3) * 0.2;
    greenLight.intensity = 0.5 + Math.sin(time * 0.5) * 0.3;

    // Fog color shift
    const fogColor = new THREE.Color(0x228B22);
    fogColor.offsetHSL(Math.sin(time * 0.2) * 0.1, 0, 0);
    scene.fog.color = fogColor;
}

function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('fruits').textContent = gameState.fruits;
    document.getElementById('enemies').textContent = gameState.enemiesDefeated;

    const healthPercent = Math.max(0, gameState.health);
    document.getElementById('health-fill').style.width = healthPercent + '%';
}

function endGame() {
    gameState.gameOver = true;
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('game-over').style.display = 'block';
}

// ==================== ANIMATION LOOP ====================
let lastTime = Date.now();

function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();
    const delta = currentTime - lastTime;
    lastTime = currentTime;

    gameState.time += delta * 0.001;
    gameState.terrainPhase += 0.003;

    updateHippo(delta);
    updateCamera();
    updateFruits(delta);
    updateEnemies(delta);
    updateWaterShots(delta);
    updateTerrain();
    updateLighting();

    // Spawn more enemies over time
    if (Math.random() < 0.001 && enemies.length < 15) {
        spawnEnemy();
    }

    renderer.render(scene, camera);
}

// ==================== START GAME ====================
document.getElementById('loading').style.display = 'none';
animate();
