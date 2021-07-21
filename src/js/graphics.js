import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Sets up scene with camera, controls and renderer 
 * @param starting_camera_pos the starting y position of the camera
 * @return an array containing the scene, camera, renderer, and controls in that order
 */
function setupScene(starting_camera_pos){
    //setup new scene
    const scene = new THREE.Scene();
    
    //setup camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
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
 * Creates a light
 * @param scene the scene to add to
 * @param light_type the type of light to add: Point or Ambient
 * @param light_color the color of light
 * @param light_intensity the intensity of light
 * @param light_position the position of the light
 * @return the light
 */
function addLight(light_type, light_color, light_intensity, light_position) {
    var light;
    switch (light_type){
        case "Point":
            light = new THREE.PointLight(light_color, light_intensity, 0, 2);
            light.position.copy(light_position)
            light.castShadow = true;
            break;
        case "Ambient":
            light = new THREE.AmbientLight(light_color, light_intensity);
            break;
        default:
            break;  
    }
    return light
}

/**
 * Creates a solid and wireframe Sphere
 * @param radius the radius of the sphere
 * @param lunes the number of horizontal divisions
 * @param segments the number of vertical divisions
 * @param texture the texture image to map to the sphere
 * @param show_wireframe the bool that toggles the wireframe
 * @param side the side to render
 * @returns an array containing the sphere and wireframe in that order
 */
function addSphere(radius, lunes, segments, texture, show_wireframe, side){
    //create sphere
   var geometry = new THREE.SphereGeometry(radius, lunes, segments);
   var material = new THREE.MeshStandardMaterial({
       map: loadTexture(texture),
       metalness: 0.3,
       roughness: 0.8,
       side: side
   })
   var sphere = new THREE.Mesh(geometry, material);

   //create wireframe
   var wireframe = new THREE.WireframeGeometry(geometry);
   var line_material = new THREE.LineBasicMaterial();
   if (!show_wireframe){
        line_material.transparent = true;
        line_material.opacity = 0;
   }
   else{
       line_material.depthTest= false;
   }
   var wireframe_sphere = new THREE.LineSegments(wireframe, line_material);
   
   return [sphere, wireframe_sphere]
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
    addLight,
    addSphere,
    loadTexture
}