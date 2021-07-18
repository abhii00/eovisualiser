import React from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'three/examples/jsm/libs/dat.gui.module.js';

class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

class App extends React.Component {
    componentDidMount() {
        /*set up new scene*/
        const scene = new THREE.Scene();
        
        /*set up camera*/
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
        camera.position.z = 5;

        /*set up renderer*/
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        this.mount.appendChild( renderer.domElement );

        /*set up camera controls*/
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.update();

        /*set up lights*/
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.AmbientLight(color, intensity);
        scene.add(light);

        /*create gui*/
        const gui = new GUI();
        gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');

        /*create box object*/
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshPhongMaterial( { color: 0xffffff } );
        var cube = new THREE.Mesh( geometry, material );
        scene.add( cube );

        function animate(){
            requestAnimationFrame( animate );
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
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