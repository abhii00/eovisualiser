import React from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
//import { ColorGUIHelper } from "./utils.js"

import earth_texture from "../assets/textures/earth_2k.jpg"

class App extends React.Component {
    constructor(props){
        super(props);

        this.unscaled_astro_consts = {
            AU: 1.496*(10**8), //km
            earth_radius: 6378 //km
        }

        this.consts = {
            debug: false,
            starting_camera: 1.8, //multiplier
            scale_factor: 10**-3, //multiplier
            earth_lunes: 40, 
            earth_segments: 40
        }

        this.astro_consts = {}
        for (const [key, value] of Object.entries(this.unscaled_astro_consts)) {
            this.astro_consts[key] = value*this.consts.scale_factor
        }

    }

    /**
     * Sets up scene with camera, controls and renderer 
     * @return an array containing the scene, camera, renderer, and controls in that order
     */
    setupScene(){
        //setup new scene
        const scene = new THREE.Scene();
        
        //setup camera
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 2000 );
        camera.position.x = this.astro_consts.earth_radius*this.consts.starting_camera;

        //setup renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.mount.appendChild( renderer.domElement );

        //setup camera controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.update();

        return [scene, camera, renderer, controls]
    }

    /**
     * Sets up lighting for a scene
     * @param scene the scene to add to
     * @return an array containing the sun_light, ambient_light in that order
     */
    addLights(scene) {
        //create sun lighting
        const sun_light = new THREE.PointLight(0xffffff, 100, 0, 2);
        sun_light.position.set(this.astro_consts.AU, 0, 0);
        sun_light.castShadow = true;

        //create ambient lighting
        const ambient_light = new THREE.AmbientLight(0xffffff, 1);

        //add items to scene
        scene.add( sun_light);
        scene.add( ambient_light);

        return [sun_light, ambient_light]
    }

    /**
     * Creates Earth solid geometry and wireframe for a scene
     * @param scene the scene to add to
     * @return an array containing the sphere and lines in that order 
     */
    addEarth(scene){
        //create sphere
        var geometry = new THREE.SphereGeometry( this.astro_consts.earth_radius, this.consts.earth_lunes, this.consts.earth_segments );
        var material = new THREE.MeshBasicMaterial({map: this.loadTexture(earth_texture)});
        var sphere = new THREE.Mesh( geometry, material );
        
        //create wireframe
        var wireframe = new THREE.WireframeGeometry( geometry );
        var line_material = new THREE.LineBasicMaterial();
        if (!this.consts.debug){
            line_material.transparent = true;
            line_material.opacity = 0;
        }
        var lines = new THREE.LineSegments( wireframe , line_material);
        lines.material.depthTest = false;
        if (this.consts.debug){
            
        }

        //add items to scene
        scene.add( sphere );
        scene.add( lines );

        return [sphere, lines]
    }

    /**
     * Loads a texture given an imported image object
     * @param {Image} image_object the image object
     * @return a texture object
     */
    loadTexture(image_object){
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(image_object)

        return texture
    }

    componentDidMount() {
        const [scene, camera, renderer, ] = this.setupScene()
        const [,] = this.addLights(scene)
        var [earth_sphere, earth_lines] = this.addEarth(scene)
        
        /*
        const gui1 = new GUI();
        gui1.addColor(new ColorGUIHelper(sun, 'color'), 'value').name('color');
        */

        function animate(){
            requestAnimationFrame( animate );

            earth_sphere.rotation.y += 0.001;
            earth_lines.rotation.y += 0.001;

            renderer.render( scene, camera );
        };
        animate();       
    }

    render() {
        return (
            <div className="app" ref={ref => (this.mount = ref)} />
        )
    }
}

export default App