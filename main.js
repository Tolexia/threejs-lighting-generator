import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import Stats from 'three/addons/libs/stats.module.js';

/**
 * Scene setup
 */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0c);

// Camera
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(5.5, 8.2, 17.5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

// Stats
const stats = new Stats();
stats.dom.style.cssText = 'position:fixed;top:0;left:0;z-index:20;';
document.body.appendChild(stats.dom);

// For using RectAreaLight
RectAreaLightUniformsLib.init(renderer);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.45, 0);

/**
 * 3D Objects
 */

// Ground
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.92, metalness: 0.05 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Box
const box = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x8a8a98, roughness: 0.45, metalness: 0.15 })
);
box.position.y = 0.6;
box.castShadow = true;
box.receiveShadow = true;
scene.add(box);

/**
 * Lights
 */

/* ——— Ambient (no helper in Three.js) ——— */
const ambientLight = new THREE.AmbientLight(0x303048, 0.12);
ambientLight.name = 'AmbientLight';
scene.add(ambientLight);

const ambientParams = {
    enabled: true,
    intensity: ambientLight.intensity,
    color: hexColor(ambientLight.color)
};

function applyAmbFromParams() {
    ambientLight.visible = ambientParams.enabled;
    ambientLight.intensity = ambientParams.intensity;
    ambientLight.color.set(ambientParams.color);
    scheduleLightExport();
}

/* ——— Directional ——— */
const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
dirLight.name = 'DirectionalLight';
dirLight.position.set(10, 5, 3);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 40;
dirLight.shadow.camera.left = -8;
dirLight.shadow.camera.right = 8;
dirLight.shadow.camera.top = 8;
dirLight.shadow.camera.bottom = -8;
dirLight.shadow.bias = -0.0005;
scene.add(dirLight);
scene.add(dirLight.target);
dirLight.target.position.set(0, 0.5, 0);

const dirHelper = new THREE.DirectionalLightHelper(dirLight, 1.2, 0x66aaff);
scene.add(dirHelper);

const dirParams = {
    enabled: true,
    showHelper: true,
    intensity: dirLight.intensity,
    color: hexColor(dirLight.color),
    posX: dirLight.position.x,
    posY: dirLight.position.y,
    posZ: dirLight.position.z,
    targetX: dirLight.target.position.x,
    targetY: dirLight.target.position.y,
    targetZ: dirLight.target.position.z,
    castShadow: true,
    shadowBias: dirLight.shadow.bias,
    shadowMapSize: dirLight.shadow.mapSize.width
};

// Apply Directional Light parameters
function applyDirFromParams() {
    dirLight.visible = dirParams.enabled;
    dirLight.intensity = dirParams.intensity;
    dirLight.color.set(dirParams.color);
    dirLight.position.set(dirParams.posX, dirParams.posY, dirParams.posZ);
    dirLight.target.position.set(dirParams.targetX, dirParams.targetY, dirParams.targetZ);
    dirLight.castShadow = dirParams.castShadow;
    dirLight.shadow.bias = dirParams.shadowBias;
    const s = Math.round(dirParams.shadowMapSize);
    dirLight.shadow.mapSize.set(s, s);
    dirLight.shadow.camera.updateProjectionMatrix();
    dirHelper.visible = dirParams.enabled && dirParams.showHelper;
    scheduleLightExport();
}

/* ——— Hemisphere ——— */
const hemiLight = new THREE.HemisphereLight(0x88c8ff, 0x332211, 0.35);
hemiLight.name = 'HemisphereLight';
hemiLight.position.set(0, 10, 0);
scene.add(hemiLight);

const hemiHelper = new THREE.HemisphereLightHelper(hemiLight, 1.5);
scene.add(hemiHelper);

const hemiParams = {
    enabled: true,
    showHelper: true,
    intensity: hemiLight.intensity,
    skyColor: hexColor(hemiLight.color),
    groundColor: hexColor(hemiLight.groundColor),
    posX: hemiLight.position.x,
    posY: hemiLight.position.y,
    posZ: hemiLight.position.z
};

function applyHemiFromParams() {
    hemiLight.visible = hemiParams.enabled;
    hemiLight.intensity = hemiParams.intensity;
    hemiLight.color.set(hemiParams.skyColor);
    hemiLight.groundColor.set(hemiParams.groundColor);
    hemiLight.position.set(hemiParams.posX, hemiParams.posY, hemiParams.posZ);
    hemiHelper.visible = hemiParams.enabled && hemiParams.showHelper;
    scheduleLightExport();
}

/* ——— Point ——— */
const pointLight = new THREE.PointLight(0xffaa66, 10.1, 7, 1);
pointLight.name = 'PointLight';
pointLight.position.set(-3.5, 2.2, 2);
pointLight.castShadow = true;
pointLight.shadow.mapSize.set(1024, 1024);
scene.add(pointLight);

const pointHelper = new THREE.PointLightHelper(pointLight, 0.35, 0xff8844);
scene.add(pointHelper);

const pointParams = {
    enabled: true,
    showHelper: true,
    intensity: pointLight.intensity,
    color: hexColor(pointLight.color),
    distance: pointLight.distance,
    decay: pointLight.decay,
    castShadow: true,
    posX: pointLight.position.x,
    posY: pointLight.position.y,
    posZ: pointLight.position.z
};

function applyPointFromParams() {
    pointLight.visible = pointParams.enabled;
    pointLight.intensity = pointParams.intensity;
    pointLight.color.set(pointParams.color);
    pointLight.distance = pointParams.distance;
    pointLight.decay = pointParams.decay;
    pointLight.castShadow = pointParams.castShadow;
    pointLight.position.set(pointParams.posX, pointParams.posY, pointParams.posZ);
    pointHelper.visible = pointParams.enabled && pointParams.showHelper;
    scheduleLightExport();
}

/* ——— Spot ——— */
const spotLight = new THREE.SpotLight(0xffffff, 1.4, 18, Math.PI / 6, 0.35, 1);
spotLight.name = 'SpotLight';
spotLight.position.set(2.5, 11.3, -9);
spotLight.castShadow = true;
spotLight.shadow.mapSize.set(1024, 1024);
spotLight.shadow.bias = -0.0002;
spotLight.distance = 17.5;
spotLight.angle = THREE.MathUtils.degToRad(8);


scene.add(spotLight);
scene.add(spotLight.target);
spotLight.target.position.set(0, 0.5, 0);

const spotHelper = new THREE.SpotLightHelper(spotLight, 0xff66aa);
scene.add(spotHelper);

const spotParams = {
    enabled: true,
    showHelper: true,
    intensity: spotLight.intensity,
    color: hexColor(spotLight.color),
    distance: spotLight.distance,
    angleDeg: THREE.MathUtils.radToDeg(spotLight.angle),
    penumbra: spotLight.penumbra,
    decay: spotLight.decay,
    castShadow: true,
    posX: spotLight.position.x,
    posY: spotLight.position.y,
    posZ: spotLight.position.z,
    targetX: spotLight.target.position.x,
    targetY: spotLight.target.position.y,
    targetZ: spotLight.target.position.z
};

function applySpotFromParams() {
    spotLight.visible = spotParams.enabled;
    spotLight.intensity = spotParams.intensity;
    spotLight.color.set(spotParams.color);
    spotLight.distance = spotParams.distance;
    spotLight.angle = THREE.MathUtils.degToRad(spotParams.angleDeg);
    spotLight.penumbra = spotParams.penumbra;
    spotLight.decay = spotParams.decay;
    spotLight.castShadow = spotParams.castShadow;
    spotLight.position.set(spotParams.posX, spotParams.posY, spotParams.posZ);
    spotLight.target.position.set(spotParams.targetX, spotParams.targetY, spotParams.targetZ);
    spotHelper.visible = spotParams.enabled && spotParams.showHelper;
    scheduleLightExport();
}

/* ——— Rect area ——— */
const rectLight = new THREE.RectAreaLight(0xaaccff, 4, 3, 1.2);
rectLight.name = 'RectAreaLight';
rectLight.position.set(0, 3.2, 2.8);
rectLight.lookAt(0, 0.5, 0);
scene.add(rectLight);

let rectAreaHelper = new RectAreaLightHelper(rectLight);
scene.add(rectAreaHelper);

const rectParams = {
    enabled: true,
    showHelper: true,
    intensity: rectLight.intensity,
    color: hexColor(rectLight.color),
    width: rectLight.width,
    height: rectLight.height,
    posX: rectLight.position.x,
    posY: rectLight.position.y,
    posZ: rectLight.position.z,
    rotXDeg: THREE.MathUtils.radToDeg(rectLight.rotation.x),
    rotYDeg: THREE.MathUtils.radToDeg(rectLight.rotation.y),
    rotZDeg: THREE.MathUtils.radToDeg(rectLight.rotation.z)
};

function applyRectFromParams() {
    rectLight.visible = rectParams.enabled;
    rectLight.intensity = rectParams.intensity;
    rectLight.color.set(rectParams.color);
    rectLight.width = rectParams.width;
    rectLight.height = rectParams.height;
    rectLight.position.set(rectParams.posX, rectParams.posY, rectParams.posZ);
    rectLight.rotation.set(
        THREE.MathUtils.degToRad(rectParams.rotXDeg),
        THREE.MathUtils.degToRad(rectParams.rotYDeg),
        THREE.MathUtils.degToRad(rectParams.rotZDeg)
    );
    rectAreaHelper.visible = rectParams.enabled && rectParams.showHelper;
    scheduleLightExport();
}

function refreshRectHelperGeometry() {
    rectAreaHelper.dispose();
    scene.remove(rectAreaHelper);
    rectAreaHelper = new RectAreaLightHelper(rectLight);
    scene.add(rectAreaHelper);
    rectAreaHelper.visible = rectParams.enabled && rectParams.showHelper;
    scheduleLightExport();
}


// Update the export code
function scheduleLightExport() {
    requestAnimationFrame(refreshExportCode);
}

/**
 * GUI
 */

const gui = new GUI({ title: 'Lights' });

const fAmb = gui.addFolder('AmbientLight');
fAmb.add(ambientParams, 'enabled').name('enabled').onChange(applyAmbFromParams);
fAmb.add(ambientParams, 'intensity', 0, 2, 0.01).name('intensity').onChange(applyAmbFromParams);
fAmb.addColor(ambientParams, 'color').name('color').onChange(applyAmbFromParams);

const fDir = gui.addFolder('DirectionalLight');
fDir.add(dirParams, 'enabled').name('enabled').onChange(applyDirFromParams);
fDir.add(dirParams, 'showHelper').name('showHelper').onChange(applyDirFromParams);
fDir.add(dirParams, 'intensity', 0, 5, 0.01).name('intensity').onChange(applyDirFromParams);
fDir.addColor(dirParams, 'color').name('color').onChange(applyDirFromParams);
fDir.add(dirParams, 'posX', -20, 20, 0.05).name('positionX').onChange(applyDirFromParams);
fDir.add(dirParams, 'posY', 0, 30, 0.05).name('positionY').onChange(applyDirFromParams);
fDir.add(dirParams, 'posZ', -20, 20, 0.05).name('positionZ').onChange(applyDirFromParams);
fDir.add(dirParams, 'targetX', -10, 10, 0.05).name('targetX').onChange(applyDirFromParams);
fDir.add(dirParams, 'targetY', -2, 10, 0.05).name('targetY').onChange(applyDirFromParams);
fDir.add(dirParams, 'targetZ', -10, 10, 0.05).name('targetZ').onChange(applyDirFromParams);
fDir.add(dirParams, 'castShadow').name('castShadow').onChange(applyDirFromParams);
fDir.add(dirParams, 'shadowBias', -0.002, 0.002, 0.00001).name('shadowBias').onChange(applyDirFromParams);
fDir.add(dirParams, 'shadowMapSize', [256, 512, 1024, 2048, 4096]).name('shadowMapSize').onChange(applyDirFromParams);

const fHemi = gui.addFolder('HemisphereLight');
fHemi.add(hemiParams, 'enabled').name('enabled').onChange(applyHemiFromParams);
fHemi.add(hemiParams, 'showHelper').name('showHelper').onChange(applyHemiFromParams);
fHemi.add(hemiParams, 'intensity', 0, 4, 0.01).name('intensity').onChange(applyHemiFromParams);
fHemi.addColor(hemiParams, 'skyColor').name('skyColor').onChange(applyHemiFromParams);
fHemi.addColor(hemiParams, 'groundColor').name('groundColor').onChange(applyHemiFromParams);
fHemi.add(hemiParams, 'posX', -20, 20, 0.05).name('positionX').onChange(applyHemiFromParams);
fHemi.add(hemiParams, 'posY', 0, 30, 0.05).name('positionY').onChange(applyHemiFromParams);
fHemi.add(hemiParams, 'posZ', -20, 20, 0.05).name('positionZ').onChange(applyHemiFromParams);

const fPoint = gui.addFolder('PointLight');
fPoint.add(pointParams, 'enabled').name('enabled').onChange(applyPointFromParams);
fPoint.add(pointParams, 'showHelper').name('showHelper').onChange(applyPointFromParams);
fPoint.add(pointParams, 'intensity', 0, 10, 0.01).name('intensity').onChange(applyPointFromParams);
fPoint.addColor(pointParams, 'color').name('color').onChange(applyPointFromParams);
fPoint.add(pointParams, 'distance', 0, 40, 0.1).name('distance').onChange(applyPointFromParams);
fPoint.add(pointParams, 'decay', 0, 3, 0.01).name('decay').onChange(applyPointFromParams);
fPoint.add(pointParams, 'castShadow').name('castShadow').onChange(applyPointFromParams);
fPoint.add(pointParams, 'posX', -20, 20, 0.05).name('positionX').onChange(applyPointFromParams);
fPoint.add(pointParams, 'posY', 0, 20, 0.05).name('positionY').onChange(applyPointFromParams);
fPoint.add(pointParams, 'posZ', -20, 20, 0.05).name('positionZ').onChange(applyPointFromParams);

const fSpot = gui.addFolder('SpotLight');
fSpot.add(spotParams, 'enabled').name('enabled').onChange(applySpotFromParams);
fSpot.add(spotParams, 'showHelper').name('showHelper').onChange(applySpotFromParams);
fSpot.add(spotParams, 'intensity', 0, 10, 0.01).name('intensity').onChange(applySpotFromParams);
fSpot.addColor(spotParams, 'color').name('color').onChange(applySpotFromParams);
fSpot.add(spotParams, 'distance', 0, 40, 0.1).name('distance').onChange(applySpotFromParams);
fSpot.add(spotParams, 'angleDeg', 1, 90, 0.5).name('angleDeg').onChange(applySpotFromParams);
fSpot.add(spotParams, 'penumbra', 0, 1, 0.01).name('penumbra').onChange(applySpotFromParams);
fSpot.add(spotParams, 'decay', 0, 3, 0.01).name('decay').onChange(applySpotFromParams);
fSpot.add(spotParams, 'castShadow').name('castShadow').onChange(applySpotFromParams);
fSpot.add(spotParams, 'posX', -20, 20, 0.05).name('positionX').onChange(applySpotFromParams);
fSpot.add(spotParams, 'posY', 0, 25, 0.05).name('positionY').onChange(applySpotFromParams);
fSpot.add(spotParams, 'posZ', -20, 20, 0.05).name('positionZ').onChange(applySpotFromParams);
fSpot.add(spotParams, 'targetX', -10, 10, 0.05).name('targetX').onChange(applySpotFromParams);
fSpot.add(spotParams, 'targetY', -2, 10, 0.05).name('targetY').onChange(applySpotFromParams);
fSpot.add(spotParams, 'targetZ', -10, 10, 0.05).name('targetZ').onChange(applySpotFromParams);

const fRect = gui.addFolder('RectAreaLight');
const onRectChange = () => { applyRectFromParams(); };
const onRectResize = () => {
    applyRectFromParams();
    refreshRectHelperGeometry();
};
fRect.add(rectParams, 'enabled').name('enabled').onChange(onRectChange);
fRect.add(rectParams, 'showHelper').name('showHelper').onChange(onRectChange);
fRect.add(rectParams, 'intensity', 0, 20, 0.05).name('intensity').onChange(onRectChange);
fRect.addColor(rectParams, 'color').name('color').onChange(onRectChange);
fRect.add(rectParams, 'width', 0.1, 12, 0.05).name('width').onChange(onRectResize);
fRect.add(rectParams, 'height', 0.1, 12, 0.05).name('height').onChange(onRectResize);
fRect.add(rectParams, 'posX', -15, 15, 0.05).name('positionX').onChange(onRectChange);
fRect.add(rectParams, 'posY', 0, 15, 0.05).name('positionY').onChange(onRectChange);
fRect.add(rectParams, 'posZ', -15, 15, 0.05).name('positionZ').onChange(onRectChange);
fRect.add(rectParams, 'rotXDeg', -180, 180, 1).name('rotationXDeg').onChange(onRectChange);
fRect.add(rectParams, 'rotYDeg', -180, 180, 1).name('rotationYDeg').onChange(onRectChange);
fRect.add(rectParams, 'rotZDeg', -180, 180, 1).name('rotationZDeg').onChange(onRectChange);

applyAmbFromParams();
applyDirFromParams();
applyHemiFromParams();
applyPointFromParams();
applySpotFromParams();
applyRectFromParams();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    dirHelper.update();
    spotHelper.update();
    hemiHelper.update();
    pointHelper.update();
    if (rectAreaHelper && rectAreaHelper.update) rectAreaHelper.update();
    renderer.render(scene, camera);
    stats.update();
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ——— Code export ——— */
const exportFormatSelect = document.getElementById('export-format');
const exportIncludeHelpersCheckbox = document.getElementById('export-include-helpers');
const exportIncludeHelpersRow = document.getElementById('export-include-helpers-row');
const exportCodeEl = document.getElementById('export-code');
const copyStatus = document.getElementById('copy-status');
const codePanelEl = document.getElementById('code-panel');
const toggleExportBtn = document.getElementById('btn-toggle-export');

function syncExportIncludeHelpersControl() {
    const vanilla = exportFormatSelect.value === 'vanilla';
    exportIncludeHelpersRow.hidden = !vanilla;
}

// Helper function to convert hex string to hex number
function colorToHexString(hexWithHash) {
    return '0x' + hexWithHash.replace('#', '');
}

// Helper function to convert color to hex string
function hexColor(c) {
    return '#' + c.getHexString();
}

// Helper function to round a number to 4 decimal places
function q(n) {
    return Number(n.toFixed(4));
}

// Generate Vanilla code for enabled lights
function generateVanillaAll() {
    const anyLight = ambientParams.enabled || dirParams.enabled || hemiParams.enabled || pointParams.enabled
        || spotParams.enabled || rectParams.enabled;
    if (!anyLight) {
        return '// No lights are enabled in the GUI. Turn on "enabled" on one or more lights to generate code.';
    }

    const includeHelpers = exportIncludeHelpersCheckbox.checked;
    const blocks = [];
    const needsRect = rectParams.enabled;
    const exportRectHelper = includeHelpers && rectParams.enabled && rectParams.showHelper;
    const header = ["import * as THREE from 'three';"];
    if (needsRect) {
        header.push("import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';");
        if (exportRectHelper) {
            header.push("import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';");
        }
    }
    blocks.push(header.join('\n'));
    if (needsRect) {
        blocks.push('\nRectAreaLightUniformsLib.init(renderer);\n');
    }

    if (ambientParams.enabled) {
        blocks.push(`// --- AmbientLight ---
const ambientLight = new THREE.AmbientLight(${colorToHexString(ambientParams.color)}, ${ambientParams.intensity.toFixed(3)});
scene.add(ambientLight);`);
    }

    if (dirParams.enabled) {
        let s = `// --- DirectionalLight ---
const directionalLight = new THREE.DirectionalLight(${colorToHexString(dirParams.color)}, ${dirParams.intensity.toFixed(3)});
directionalLight.position.set(${dirParams.posX.toFixed(3)}, ${dirParams.posY.toFixed(3)}, ${dirParams.posZ.toFixed(3)});
directionalLight.castShadow = ${dirParams.castShadow};
directionalLight.shadow.bias = ${dirParams.shadowBias};
directionalLight.shadow.mapSize.set(${dirParams.shadowMapSize}, ${dirParams.shadowMapSize});
scene.add(directionalLight);
const dirTarget = new THREE.Object3D();
dirTarget.position.set(${dirParams.targetX.toFixed(3)}, ${dirParams.targetY.toFixed(3)}, ${dirParams.targetZ.toFixed(3)});
scene.add(dirTarget);
directionalLight.target = dirTarget;`;
        if (includeHelpers && dirParams.showHelper) {
            s += `
const directionalHelper = new THREE.DirectionalLightHelper(directionalLight, 1.2, 0x66aaff);
scene.add(directionalHelper);`;
        }
        blocks.push(s);
    }

    if (hemiParams.enabled) {
        let s = `// --- HemisphereLight ---
const hemisphereLight = new THREE.HemisphereLight(
${colorToHexString(hemiParams.skyColor)},
${colorToHexString(hemiParams.groundColor)},
${hemiParams.intensity.toFixed(3)}
);
hemisphereLight.position.set(${hemiParams.posX.toFixed(3)}, ${hemiParams.posY.toFixed(3)}, ${hemiParams.posZ.toFixed(3)});
scene.add(hemisphereLight);`;
        if (includeHelpers && hemiParams.showHelper) {
            s += `
const hemisphereHelper = new THREE.HemisphereLightHelper(hemisphereLight, 1.5);
scene.add(hemisphereHelper);`;
        }
        blocks.push(s);
    }

    if (pointParams.enabled) {
        let s = `// --- PointLight ---
const pointLight = new THREE.PointLight(${colorToHexString(pointParams.color)}, ${pointParams.intensity.toFixed(3)}, ${pointParams.distance.toFixed(3)}, ${pointParams.decay.toFixed(3)});
pointLight.position.set(${pointParams.posX.toFixed(3)}, ${pointParams.posY.toFixed(3)}, ${pointParams.posZ.toFixed(3)});
pointLight.castShadow = ${pointParams.castShadow};
scene.add(pointLight);`;
        if (includeHelpers && pointParams.showHelper) {
            s += `
const pointHelper = new THREE.PointLightHelper(pointLight, 0.35, 0xff8844);
scene.add(pointHelper);`;
        }
        blocks.push(s);
    }

    if (spotParams.enabled) {
        const angleRad = THREE.MathUtils.degToRad(spotParams.angleDeg);
        let s = `// --- SpotLight ---
const spotLight = new THREE.SpotLight(
${colorToHexString(spotParams.color)},
${spotParams.intensity.toFixed(3)},
${spotParams.distance.toFixed(3)},
${angleRad.toFixed(5)},
${spotParams.penumbra.toFixed(3)},
${spotParams.decay.toFixed(3)}
);
spotLight.position.set(${spotParams.posX.toFixed(3)}, ${spotParams.posY.toFixed(3)}, ${spotParams.posZ.toFixed(3)});
spotLight.castShadow = ${spotParams.castShadow};
scene.add(spotLight);
const spotTarget = new THREE.Object3D();
spotTarget.position.set(${spotParams.targetX.toFixed(3)}, ${spotParams.targetY.toFixed(3)}, ${spotParams.targetZ.toFixed(3)});
scene.add(spotTarget);
spotLight.target = spotTarget;`;
        if (includeHelpers && spotParams.showHelper) {
            s += `
const spotHelper = new THREE.SpotLightHelper(spotLight, 0xff66aa);
scene.add(spotHelper);`;
        }
        blocks.push(s);
    }

    if (rectParams.enabled) {
        let s = `// --- RectAreaLight ---
const rectAreaLight = new THREE.RectAreaLight(
${colorToHexString(rectParams.color)},
${rectParams.intensity.toFixed(3)},
${rectParams.width.toFixed(3)},
${rectParams.height.toFixed(3)}
);
rectAreaLight.position.set(${rectParams.posX.toFixed(3)}, ${rectParams.posY.toFixed(3)}, ${rectParams.posZ.toFixed(3)});
rectAreaLight.rotation.set(
${THREE.MathUtils.degToRad(rectParams.rotXDeg).toFixed(5)},
${THREE.MathUtils.degToRad(rectParams.rotYDeg).toFixed(5)},
${THREE.MathUtils.degToRad(rectParams.rotZDeg).toFixed(5)}
);
scene.add(rectAreaLight);`;
        if (includeHelpers && rectParams.showHelper) {
            s += `
const rectAreaHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaHelper);`;
        }
        blocks.push(s);
    }

    const helperNote = [];
    if (includeHelpers && dirParams.enabled && dirParams.showHelper) helperNote.push('directionalHelper.update();');
    if (includeHelpers && spotParams.enabled && spotParams.showHelper) helperNote.push('spotHelper.update();');
    if (includeHelpers && hemiParams.enabled && hemiParams.showHelper) helperNote.push('hemisphereHelper.update();');
    if (includeHelpers && pointParams.enabled && pointParams.showHelper) helperNote.push('pointHelper.update();');
    if (includeHelpers && rectParams.enabled && rectParams.showHelper) helperNote.push('rectAreaHelper.update();');
    if (helperNote.length) {
        blocks.push(`\n// In your animation loop:\nfunction updateLightHelpers() {\n  ${helperNote.join('\n  ')}\n}`);
    }

    return blocks.join('\n\n');
}

// Generate R3F code for enabled lights
function generateR3FAll() {
    const anyLight = ambientParams.enabled || dirParams.enabled || hemiParams.enabled || pointParams.enabled
        || spotParams.enabled || rectParams.enabled;
    if (!anyLight) {
        return '// No lights are enabled in the GUI.';
    }

    const lines = [];
    lines.push('// @react-three/fiber — fragments for currently enabled lights\n');

    if (ambientParams.enabled) {
        lines.push(`{/* --- AmbientLight --- */}
<ambientLight color="${ambientParams.color}" intensity={${q(ambientParams.intensity)}} />`);
    }
    if (dirParams.enabled) {
        lines.push(`{/* --- DirectionalLight --- */}
<directionalLight
color="${dirParams.color}"
intensity={${q(dirParams.intensity)}}
position={[${q(dirParams.posX)}, ${q(dirParams.posY)}, ${q(dirParams.posZ)}]}
castShadow={${dirParams.castShadow}}
shadow-bias={${q(dirParams.shadowBias)}}
shadow-mapSize={[${dirParams.shadowMapSize}, ${dirParams.shadowMapSize}]}
/>
// Target [${q(dirParams.targetX)}, ${q(dirParams.targetY)}, ${q(dirParams.targetZ)}]: wire light.target via ref`);
    }
    if (hemiParams.enabled) {
        lines.push(`{/* --- HemisphereLight --- */}
<hemisphereLight
skyColor="${hemiParams.skyColor}"
groundColor="${hemiParams.groundColor}"
intensity={${q(hemiParams.intensity)}}
position={[${q(hemiParams.posX)}, ${q(hemiParams.posY)}, ${q(hemiParams.posZ)}]}
/>`);
    }
    if (pointParams.enabled) {
        lines.push(`{/* --- PointLight --- */}
<pointLight
color="${pointParams.color}"
intensity={${q(pointParams.intensity)}}
distance={${q(pointParams.distance)}}
decay={${q(pointParams.decay)}}
position={[${q(pointParams.posX)}, ${q(pointParams.posY)}, ${q(pointParams.posZ)}]}
castShadow={${pointParams.castShadow}}
/>`);
    }
    if (spotParams.enabled) {
        lines.push(`{/* --- SpotLight --- */}
<spotLight
color="${spotParams.color}"
intensity={${q(spotParams.intensity)}}
distance={${q(spotParams.distance)}}
angle={${q(THREE.MathUtils.degToRad(spotParams.angleDeg))}}
penumbra={${q(spotParams.penumbra)}}
decay={${q(spotParams.decay)}}
position={[${q(spotParams.posX)}, ${q(spotParams.posY)}, ${q(spotParams.posZ)}]}
castShadow={${spotParams.castShadow}}
/>
// Target [${q(spotParams.targetX)}, ${q(spotParams.targetY)}, ${q(spotParams.targetZ)}]: wire light.target via ref`);
    }
    if (rectParams.enabled) {
        lines.push(`{/* --- RectAreaLight --- */}
<rectAreaLight
color="${rectParams.color}"
intensity={${q(rectParams.intensity)}}
width={${q(rectParams.width)}}
height={${q(rectParams.height)}}
position={[${q(rectParams.posX)}, ${q(rectParams.posY)}, ${q(rectParams.posZ)}]}
rotation={[
${q(THREE.MathUtils.degToRad(rectParams.rotXDeg))},
${q(THREE.MathUtils.degToRad(rectParams.rotYDeg))},
${q(THREE.MathUtils.degToRad(rectParams.rotZDeg))}
]}
/>
// RectAreaLightUniformsLib.init(renderer) once in Canvas onCreated if needed`);
    }

    return lines.join('\n\n');
}

// Refresh the export code when changes are made
function refreshExportCode() {
    const fmt = exportFormatSelect.value;
    exportCodeEl.value = fmt === 'vanilla' ? generateVanillaAll() : generateR3FAll();
    copyStatus.textContent = '';
}

// Handling events
exportFormatSelect.addEventListener('change', () => {
    syncExportIncludeHelpersControl();
    refreshExportCode();
});
exportIncludeHelpersCheckbox.addEventListener('change', refreshExportCode);
document.getElementById('btn-refresh-code').addEventListener('click', refreshExportCode);
document.getElementById('btn-copy-code').addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(exportCodeEl.value);
        copyStatus.textContent = 'Copied.';
        setTimeout(() => { copyStatus.textContent = ''; }, 2000);
    } catch {
        copyStatus.textContent = 'Copy failed — select the text manually.';
    }
});
toggleExportBtn.addEventListener('click', () => {
    const isCollapsed = codePanelEl.classList.toggle('is-collapsed');
    toggleExportBtn.setAttribute('aria-expanded', String(!isCollapsed));
    toggleExportBtn.title = isCollapsed ? 'Expand panel' : 'Collapse panel';
    toggleExportBtn.setAttribute('aria-label', isCollapsed ? 'Expand code export panel' : 'Collapse code export panel');
});

// Executes first generation of export code
syncExportIncludeHelpersControl();
refreshExportCode();
gui.add({ refreshCodePanel: refreshExportCode }, 'refreshCodePanel').name('Refresh code export');

// Start animating
animate();