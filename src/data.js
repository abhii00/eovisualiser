import * as THREE from 'three';
import * as satellite from 'satellite.js';

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
     * Processes TLE data and creates ECI datapoints 
     */
    processTLEData(){
        var split_data = this.raw_data.split(/\r?\n/);
        const date = new Date();

        for (var i = 0; i < (split_data.length-1)/3; i++){
            var entry = 3*i;

            var record = satellite.twoline2satrec(split_data[entry+1], split_data[entry+2])
            var posvel = satellite.propagate(record, date);
            if (posvel.position !== undefined){
                var pos = new THREE.Vector3(posvel.position.x, posvel.position.y, posvel.position.z);

                const mesh = new THREE.Mesh(this.sphere_geometry, this.sphere_material);
                mesh.position.copy(pos.multiplyScalar(this.scale_factor));

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
            this.scene.add(datapoint.mesh)
        }
    }
}

/**
 * An individual ECI datapoint
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
    DataSet
}