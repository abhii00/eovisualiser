import * as THREE from 'three';
import * as satellite from 'satellite.js';

import { updateMousePosition } from './graphics';
import { convertDate } from './utils';

/**
 * A Dataset
 * @param type the type of data provided, currently supports: satellite-tle
 * @param raw the raw dataset
 * @param scale_factor the scaling factor for display
 */
class DataSet {
    constructor(type, raw, scale_factor, scene, camera, renderer){
        this.raw_data = raw;
        this.scale_factor = scale_factor;
        this.datapoints = {};

        //three js environment
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        //reusable geometry and material
        this.sphere_geometry = new THREE.SphereBufferGeometry(0.01, 2, 2);
        this.sphere_material = new THREE.MeshBasicMaterial();

        //intersections and interactions
        this.createDataPointInteractions(this.scene, this.camera, this.renderer);
        this.raycaster = new THREE.Raycaster();
        this.intersects = [];

        //workflow
        this.type = type;
        switch(this.type){
            case 'satellite-tle':
                this.processTLEData();
            break;
            default:
            break;
        }
        this.renderDataPoints();
    }

    /**
     * Processes TLE data and creates ECF datapoints 
     */
    processTLEData(){
        var split_data = this.raw_data.split(/\r?\n/);
        const date = new Date();

        for (var i = 0; i < (split_data.length-1)/3; i++){
            var entry = 3*i;

            var record = satellite.twoline2satrec(split_data[entry+1], split_data[entry+2])
            var posvel_eci = satellite.propagate(record, date);
            if (posvel_eci.position !== undefined){
                //calculate eci position
                var pos_eci = posvel_eci.position;
                var pos_three_eci = new THREE.Vector3(pos_eci.x, pos_eci.z, pos_eci.y); //need to swap y and z axis i.e. x-z plane is plane of earth
                pos_three_eci.multiplyScalar(this.scale_factor);

                //calculate ecf position
                var pos_ecf = satellite.eciToEcf(pos_eci, convertDate('gmst'));
                var pos_three_ecf = new THREE.Vector3(pos_ecf.x, pos_ecf.z, pos_ecf.y);
                pos_three_ecf.multiplyScalar(this.scale_factor);

                //create mesh and name
                const mesh = new THREE.Mesh(this.sphere_geometry, this.sphere_material.clone());
                mesh.position.copy(pos_three_eci);
                mesh.name = split_data[entry];
                
                //color mesh
                if (Math.abs(pos_three_ecf.x) < 0.05) {mesh.material.color = new THREE.Color(0xff0000)} //color those that lie on prime meridian
                else if (Math.abs(pos_three_ecf.y) < 0.05) {mesh.material.color = new THREE.Color(0x00ff00)} //color those that lie in celestial plane
                else {mesh.material.color = new THREE.Color(0xffffff)}

                var datapoint = new ECIDataPoint(mesh);
                this.datapoints[split_data[entry]] =  datapoint;
            }
        }
    }

    /**
     * Renders a set of data points for the dataset into the datasets scene
     */
    renderDataPoints(){
        for (var datapoint in this.datapoints){
            this.scene.add(this.datapoints[datapoint].mesh);
        }
    }

    /**
     * Highlights a datapoint object on hover
     * @param e the event on which to trigger
     * @param scene the scene into which to render
     * @param camera the camera used for the scene
     * @param renderer the renderer for the scene
     */
    highlightDataPoints(e, scene, camera, renderer){
        //undo previous hover
        var datapoint;
        for (var intersect of this.intersects){
            datapoint = this.datapoints[intersect];
            datapoint.mesh.material.color.set(0xffffff);
        }
        this.intersects = [];
        
        //get mouse position and raycaster intersects
        const mouse = updateMousePosition(e);
        this.raycaster.setFromCamera(mouse, camera);
        const new_intersects = this.raycaster.intersectObjects(scene.children);

        //do new hover
        for (var new_intersect of new_intersects) {
            if (new_intersect.object.name !== ''){
                datapoint = this.datapoints[new_intersect.object.name];
                datapoint.mesh.material.color.set(0xff0000);

                this.intersects.push(new_intersect.object.name);
            }
        }

        //change to pointer
        if (this.intersects.length > 0) { 
            document.body.style.cursor = 'pointer';
         } 
        else { 
            document.body.style.cursor = 'default' ;
        }
    }

    /**
     * Creates all the user interactions for the dataset into the scene
     * @param scene the scene into which to render
     * @param camera the camera used for the scene
     * @param renderer the renderer for the scene 
     */
    createDataPointInteractions(scene, camera, renderer){
        var highlight = (e) => this.highlightDataPoints(e, scene, camera, renderer);

        window.addEventListener('mousemove',highlight,false); 
    }
}

/**
 * An individual ECI datapoint
 * @param mesh the object for the point
 */
class ECIDataPoint{
    constructor(mesh){
        this.mesh = mesh;
    }
}

export {
    DataSet,
    ECIDataPoint
}