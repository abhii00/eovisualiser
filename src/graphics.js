import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { calculateEarthRotation, calculateSunPositionECI } from './utils';

import earth_texture from './assets/textures/earth_2k.jpg';

/**
 * Creates scene with camera, controls and renderer 
 * @param starting_camera_pos the starting y position of the camera
 * @return an array containing the scene, camera, renderer in that order
 */
function createScene(starting_camera_pos){
    //create new scene
    const scene = new THREE.Scene();
    
    //create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1);
    camera.position.copy(starting_camera_pos)

    //create renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //create camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    return [scene, camera, renderer]
}

/**
 * Creates the environment i.e. lighting, sun, earth etc.
 * @param scene the scene into which to render
 * @param camera the camera used for the scene
 * @param renderer the renderer for the scene
 */
function createEnvironment(scene, camera, renderer){
    /*
    6378km (1 R_e) is mapped to 1 unit,
    sun positioned 80 units away rather than approx 20,000,
    everything is in ECI (sun, space objects) and earth is rotated to match this
    x,y,z in actual coords is mapped to x,z,-y i.e. y up instead of z up so x-z plane is equatorial plane
    */

    //reusable geometry
    const sphere_geometry = new THREE.SphereBufferGeometry(1,60,60);
    
    //space sphere
    const space_material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.BackSide        
    });
    const space = new THREE.Mesh(sphere_geometry, space_material);
    space.scale.set(100,100,100);
    scene.add(space);

    //sun
    const sun_offset = 80;
    const sun_pos = calculateSunPositionECI();
    sun_pos.multiplyScalar(sun_offset);

    const sun_light = new THREE.PointLight(0xffffff, 1);
    sun_light.position.copy(sun_pos);
    scene.add(sun_light);

    const sun_material = new THREE.MeshBasicMaterial();
    const sun = new THREE.Mesh(sphere_geometry, sun_material);
    sun.scale.set(2,2,2);
    sun.position.copy(sun_pos);
    scene.add(sun);

    //earth
    const earth_material = new THREE.MeshStandardMaterial({
        map: loadTexture(earth_texture),
        metalness: 0.4,
        roughness: 0.8
    }); 
    const earth = new THREE.Mesh(sphere_geometry, earth_material);
    earth.rotation.set(0,calculateEarthRotation(),0);
    scene.add(earth);  
    
    //animate
    function animate(){
        requestAnimationFrame(animate);

        render();
    }

    //render
    function render() {
        renderer.render(scene, camera);
    }

    animate();
}

/**
 * Creates the debug overlay i.e. axes
 * @param scene the scene into which to render
 * @param camera the camera used for the scene
 * @param renderer the renderer for the scene
 */
function createDebugOverlay(scene, camera, renderer){
    const origin = new THREE.Vector3(0,0,0);

    //line connecting earth and sun
    const sun_offset = 80;
    const sun = calculateSunPositionECI();
    sun.multiplyScalar(sun_offset);
    const earth_sun_line = createLine(origin, sun, 0xffffff);
    scene.add(earth_sun_line);

    //ECI axes
    const vernal_equinox = createLine(origin, new THREE.Vector3(2,0,0), 0x00ff00); //green is vernal equinox
    const perp_equinox = createLine(origin, new THREE.Vector3(0,0,-2), 0x005000); //dark green is perpendicular
    scene.add(vernal_equinox);
    scene.add(perp_equinox);

    //ECF
    const prime_meridian = createLine(origin, new THREE.Vector3(2,0,0), 0xff0000); //red is prime meridian
    const perp_meridian = createLine(origin, new THREE.Vector3(0,0,-2), 0x500000); //dark red is perpendicular
    prime_meridian.rotation.set(0,calculateEarthRotation(),0);
    perp_meridian.rotation.set(0,calculateEarthRotation(),0);
    scene.add(prime_meridian);
    scene.add(perp_meridian);
}

/**
 * Creates a line between two points
 * @param p1 the start point
 * @param p2 the end point
 * @param color the line color
 * @returns a THREE.line object connecting the two points
 */
function createLine(p1, p2, color){
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1, p2]), new THREE.LineBasicMaterial({color: color}))
}

/**
 * Updates the position of the mouse on an event
 * @param e the event on which to update the mouse position
 * @returns a THREE Vector2 object containing the x and y position of the mouse
 */
 function updateMousePosition(e){
    const mouse = new THREE.Vector2();
    mouse.x = (e.clientX / window.innerWidth)*2 - 1;
    mouse.y = -(e.clientY / window.innerHeight)*2 + 1;
    return mouse;
}

/**
 * Loads a texture given an imported image object
 * @param {Image} image_object the image object
 * @return a texture object
 */
function loadTexture(image_object){
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(image_object)

    return texture
}

export {
    createScene,
    createEnvironment,
    createDebugOverlay,
    updateMousePosition,
    createLine,
    loadTexture
}