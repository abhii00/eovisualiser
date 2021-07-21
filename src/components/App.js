import React from "react";
import * as THREE from "three";
//import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

import { setupScene, addLight, addSphere } from '../js/graphics.js'
//import { ColorGUIHelper } from "../js/utils.js"

import earth_texture from "../assets/textures/earth_2k.jpg"
import space_texture from "../assets/textures/space_8k.jpg"

class App extends React.Component {
    constructor(props){
        super(props);

        this.unscaled_astro_consts = {
            AU: 1.496*(10**8), //km
            earth_radius: 6378, //km
            space_radius: 1.5*(10**6) //km
        }

        this.shape_consts = {
            earth_lunes: 40, 
            earth_segments: 40,
            space_lunes: 300,
            space_segments: 300,
        }

        this.consts = {
            debug: false,
            starting_camera: 1.8, //multiplier
            scale_factor: 10**-3, //multiplier
        }

        this.astro_consts = {}
        for (const [key, value] of Object.entries(this.unscaled_astro_consts)) {
            this.astro_consts[key] = value*this.consts.scale_factor
        }
    }

    componentDidMount() {
        const [scene, camera, renderer, ] = setupScene(new THREE.Vector3(0,0,this.astro_consts.earth_radius*this.consts.starting_camera))
        this.mount.appendChild(renderer.domElement);

        const sun_light = addLight("Point", 0xffffff, 1.25, new THREE.Vector3(this.astro_consts.AU,0,0));

        const [space_sphere, space_wireframe] = addSphere(this.astro_consts.space_radius, this.shape_consts.space_lunes, this.shape_consts.space_segments, space_texture, this.consts.debug, THREE.BackSide);
        var [earth_sphere, earth_wireframe] = addSphere(this.astro_consts.earth_radius, this.shape_consts.earth_lunes, this.shape_consts.earth_segments, earth_texture, this.consts.debug, THREE.FrontSide);

        scene.add(sun_light);
        scene.add(earth_sphere);
        scene.add(earth_wireframe);
        scene.add(space_sphere);
        scene.add(space_wireframe);

        /*
        const gui1 = new GUI();
        gui1.addColor(new ColorGUIHelper(sun, 'color'), 'value').name('color');
        */

        function animate(){
            requestAnimationFrame(animate);

            earth_sphere.rotation.y += 0.001;
            earth_wireframe.rotation.y += 0.001;

            renderer.render(scene, camera);
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