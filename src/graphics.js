import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import earth_texture from './assets/textures/earth_2k.jpg';

/**
 * Sets up scene with camera, controls and renderer 
 * @param starting_camera_pos the starting y position of the camera
 * @return an array containing the scene, camera, renderer, and controls in that order
 */
function setupScene(starting_camera_pos){
    //setup new scene
    const scene = new THREE.Scene();
    
    //setup camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1);
    camera.position.copy(starting_camera_pos)

    //setup renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //setup camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    return [scene, camera, renderer, controls]
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
    sun positioned 80 units away rather than approx 20,000
    */

    //lighting
    const sun_light = new THREE.PointLight(0xffffff, 1);
    sun_light.position.set(80,0,0);
    scene.add(sun_light);

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
    const sun_material = new THREE.MeshBasicMaterial();
    const sun = new THREE.Mesh(sphere_geometry, sun_material);
    sun.scale.set(2,2,2);
    sun.position.set(80,0,0);
    scene.add(sun);

    //earth
    const earth_material = new THREE.MeshStandardMaterial({
        map: loadTexture(earth_texture),
        metalness: 0.4,
        roughness: 0.8
    }); 
    const earth = new THREE.Mesh(sphere_geometry, earth_material);
    scene.add(earth); 

    //animate
    function animate(){
        requestAnimationFrame(animate);

        render();
    };

    //render
    function render() {
        renderer.render(scene, camera);
    }

    animate();
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
    setupScene,
    createEnvironment,
    loadTexture
}