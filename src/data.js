import * as THREE from 'three';
import * as satellite from 'satellite.js';

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
        this.datapoints = [];

        //three js environment
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        //reusable geometry and material
        this.sphere_geometry = new THREE.SphereBufferGeometry(0.01, 2, 2);
        this.sphere_material = new THREE.MeshBasicMaterial();


        //workflow
        this.type = type;
        switch(this.type){
            case 'satellite-tle':
                this.processTLEData();
                this.renderECIDataPoints();
            break;
            default:
            break;
        }
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

                //create mesh
                const mesh = new THREE.Mesh(this.sphere_geometry, this.sphere_material.clone());
                mesh.position.copy(pos_three_eci);
                
                //color mesh
                if (Math.abs(pos_three_ecf.x) < 0.05) {mesh.material.color = new THREE.Color(0xff0000)} //color those that lie on prime meridian
                else if (Math.abs(pos_three_ecf.y) < 0.05) {mesh.material.color = new THREE.Color(0x00ff00)} //color those that lie in celestial plane
                else {mesh.material.color = new THREE.Color(0xffffff)}

                var datapoint = new ECIDataPoint(split_data[entry], mesh);
                this.datapoints.push(datapoint);
            }
        }
    }

    /**
     * Renders a set of ECI data points for the dataset into the datasets scene
     */
    renderECIDataPoints(){
        for (var datapoint of this.datapoints){
            this.scene.add(datapoint.mesh);
        }
    }
}

/**
 * An individual ECF datapoint
 * @param id a unique id for the point
 * @param mesh the object for the point
 */
class ECIDataPoint{
    constructor(id, mesh){
        this.id = id;
        this.mesh = mesh;
    }
}

export {
    DataSet,
    ECIDataPoint
}