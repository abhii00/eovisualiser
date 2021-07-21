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
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10**10);
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
 * @param light_angle the angle for a spotlight
 * @param target_position the position of the target for a spotlight
 * @return the light
 */
function addLight(light_type, light_color, light_intensity, light_position, light_angle, target_position) {
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
        case "Spot":
            light = new THREE.SpotLight(light_color, light_intensity, 0, light_angle, 0, 2);
            light.target.position.copy(target_position);
            break;
        default:
            break;  
    }
    return light
}

class CelestialBody {
    constructor(position, radius, lunes, segments, texture, show_wireframe, side){
        this.position = position;
        this.radius = radius;
        this.lunes = lunes;
        this.segments = segments;
        this.texture = texture;
        this.show_wireframe = show_wireframe;
        this.side = side;

        this.roughness = 0.8;
        this.metalness = 0.3;

        this.createSphere();
        this.createWireframe();
    }

    createSphere(){
        this.sphere_geometry = new THREE.SphereGeometry(this.radius, this.lunes, this.segments);

        this.sphere_material = new THREE.MeshStandardMaterial({
            metalness: this.metalness,
            roughness: this.roughness,
            side: this.side
        })
        if (this.texture !== null){
            this.sphere_material.map = loadTexture(this.texture)
        }
        
        this.sphere = new THREE.Mesh(this.sphere_geometry, this.sphere_material);
        this.sphere.position.copy(this.position)
    }

    createWireframe(){
        this.wireframe_geometery = new THREE.WireframeGeometry(this.sphere_geometry);

        if (this.show_wireframe){
            this.wireframe_material = new THREE.LineBasicMaterial({
                transparent: true,
                opacity: 0
            });
        }
        else {
            this.wireframe_material = new THREE.LineBasicMaterial({
                depthTest: false
            });
        }

        this.wireframe = new THREE.LineSegments(this.wireframe, this.wireframe_material);
        this.wireframe.position.copy(this.position)
    }
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
    CelestialBody,
    loadTexture
}