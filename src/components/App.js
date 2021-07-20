import React from "react";
import * as THREE from "three";
import { PCFSoftShadowMap } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { ColorGUIHelper } from "./utils.js"

class App extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            
        }

        this.astro_consts = {
            AU: 1.496*(10**8), //km
            earth_radius: 6378 //km
        }

        this.consts = {
            earth_lunes: 20, 
            earth_segments: 20
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
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
        camera.position.x = 5;

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
        const sun_light = new THREE.PointLight(0xffffff, 100, 100);
        sun_light.position.set(100, 0, 0);
        sun_light.castShadow = true;

        //create ambient lighting
        const ambient_light = new THREE.AmbientLight(0xffffff, 0.5);

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
        var geometry = new THREE.SphereGeometry( 1, this.consts.earth_lunes, this.consts.earth_segments );
        var material = new THREE.MeshPhongMaterial( { color: 0x0000ff } );
        var sphere = new THREE.Mesh( geometry, material );
        
        //create wireframe
        var wireframe = new THREE.WireframeGeometry( geometry );
        var lines = new THREE.LineSegments( wireframe );
        lines.material.depthTest = false;

        //add items to scene
        scene.add( sphere );
        scene.add( lines );

        return [sphere, lines]
    }

    componentDidMount() {
        const [scene, camera, renderer, controls] = this.setupScene()
        const [sun_light, ambient_light] = this.addLights(scene)
        var [earth_sphere, earth_lines] = this.addEarth(scene)
        
        /*
        const gui1 = new GUI();
        gui1.addColor(new ColorGUIHelper(sun, 'color'), 'value').name('color');
        */

        function animate(){
            requestAnimationFrame( animate );
            earth_sphere.rotation.y += 0.01;
            earth_lines.rotation.y += 0.01;
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