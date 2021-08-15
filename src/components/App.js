import React from "react";
import * as THREE from "three";
//import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

import { setupScene, addLight, CelestialBody } from "./visualiser/graphics.js"
import { DataSet } from "./visualiser/data.js"
//import { ColorGUIHelper } from "../visualiser/utils.js"
import backend from "../config/backend.json"
import sources from "../config/sources.json"

import test_dataset from "../assets/datasets/test.txt"

import earth_texture from "../assets/textures/earth_2k.jpg"

class App extends React.Component {
    constructor(props){
        super(props);

        this.unscaled_astro_consts = {
            AU: 1.496*(10**8), //km
            earth_radius: 6378, //km
            sun_radius: 696340, //km
            space_radius: 10**10 //km
        }

        this.shape_consts = {
            earth_lunes: 40, 
            earth_segments: 40,
            sun_lunes: 20,
            sun_segments: 20,
            space_lunes: 300,
            space_segments: 300
        }

        this.consts = {
            debug: false,
            use_source: false,
            starting_camera: 5, //multiplier
            scale_factor: 10**-3 //multiplier
        }

        this.astro_consts = {}
        for (const [key, value] of Object.entries(this.unscaled_astro_consts)) {
            this.astro_consts[key] = value*this.consts.scale_factor
        }
    }

    componentDidMount() {
        const [scene, camera, renderer, ] = setupScene(new THREE.Vector3(0,0,this.astro_consts.earth_radius*this.consts.starting_camera))
        this.mount.appendChild(renderer.domElement);

        const sun_light = addLight("Point", 0xffffff, 1, new THREE.Vector3(this.astro_consts.AU,0,0));
        const sun = addLight("Spot", 0xffffff, 100, new THREE.Vector3(this.astro_consts.AU*0.9, 0, 0), Math.PI/200, new THREE.Vector3(this.astro_consts.AU, 0, 0));

        var Space = new CelestialBody( 
            new THREE.Vector3(0,0,0),
            this.astro_consts.space_radius, this.shape_consts.space_lunes, this.shape_consts.space_segments, 
            null, new THREE.Color(0x000000),
            this.consts.debug, THREE.BackSide
        );
        var Sun = new CelestialBody(
            new THREE.Vector3(this.astro_consts.AU,0,0),
            this.astro_consts.sun_radius, this.shape_consts.sun_lunes, this.shape_consts.sun_segments, 
            null, new THREE.Color(0xffffff), 
            true, THREE.FrontSide
        );
        var Earth = new CelestialBody(
            new THREE.Vector3(0,0,0),
            this.astro_consts.earth_radius, this.shape_consts.earth_lunes, this.shape_consts.earth_segments, 
            earth_texture, null, 
            this.consts.debug, THREE.FrontSide
        );

        var source_to_fetch;
        var imported_dataset;
        var test;

        if (this.consts.use_source){
            source_to_fetch = backend["cors-proxy"]+sources["tle-sat"];
        }
        else{
            source_to_fetch = test_dataset;   
        }

        fetch(source_to_fetch)
        .then(r => r.text())
        .then(text => imported_dataset = text)
        .then(imported_dataset => test = new DataSet("satellite-tle", imported_dataset, this.consts.scale_factor))
        .then(test => test.renderDataPoints(scene))

        scene.add(sun_light);
        scene.add(sun);
        scene.add(sun.target);

        scene.add(Space.sphere);
        scene.add(Space.wireframe);
        scene.add(Sun.sphere);
        scene.add(Sun.wireframe);
        scene.add(Earth.sphere);
        scene.add(Earth.wireframe);

        function animate(){
            requestAnimationFrame(animate);

            Earth.sphere.rotation.y += 0.0001;
            Earth.wireframe.rotation.y += 0.0001;

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