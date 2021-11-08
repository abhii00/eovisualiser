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
                this.renderECFDataPoints();
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
        const gmst = satellite.gstime(date);

        for (var i = 0; i < (split_data.length-1)/3; i++){
            var entry = 3*i;

            var record = satellite.twoline2satrec(split_data[entry+1], split_data[entry+2])
            var posvel_eci = satellite.propagate(record, date);
            if (posvel_eci.position !== undefined){
                var pos_ecf = satellite.eciToEcf(posvel_eci.position, gmst);

                var pos_three = new THREE.Vector3(pos_ecf.x, pos_ecf.z, pos_ecf.y); //need to swap y and z axis i.e. x-z plane is plane of earth
                pos_three.multiplyScalar(this.scale_factor);

                const mesh = new THREE.Mesh(this.sphere_geometry, this.sphere_material.clone());
                mesh.position.copy(pos_three);
                
                if (Math.abs(mesh.position.z) < 0.05) {mesh.material.color = new THREE.Color(0xff0000)} //color those that lie on prime meridian
                else if (Math.abs(mesh.position.y) < 0.05) {mesh.material.color = new THREE.Color(0x00ff00)} //color those that lie in celestial plane
                else {mesh.material.color = new THREE.Color(0xffffff)}

                var datapoint = new ECFDataPoint(split_data[entry], mesh);
                this.datapoints.push(datapoint);
            }
        }
    }

    /**
     * Renders a set of ECI data points for the dataset into the datasets scene
     */
    renderECFDataPoints(){
        for (var datapoint of this.datapoints){
            this.scene.add(datapoint.mesh);
            datapoint.earthRotation(calculateEarthRotation());
        }
    }
}

/**
 * An individual ECF datapoint
 * @param id a unique id for the point
 * @param mesh the object for the point
 */
class ECFDataPoint{
    constructor(id, mesh){
        this.id = id;
        this.mesh = mesh;

        this.earthTilt();
    }

    /**
     * Rotates to correct for earth tilt
     */
    earthTilt(){
        this.mesh.position.applyAxisAngle(new THREE.Vector3(0,0,1), 23.5*Math.PI/180);
    }

    /**
     * Rotates to correct for earth rotation
     * @param angle the angle around the axis of rotation to rotate in radians
     */
    earthRotation(angle){
        const axis = new THREE.Vector3(0,1,0).applyAxisAngle(new THREE.Vector3(0,0,1), 23.5*Math.PI/180);
        this.mesh.position.applyAxisAngle(axis, angle);
    }
}

/**
 * Finds the longitude of the sun i.e. the angle of rotation of the Earth
 * @returns the longitude of the sun in radians
 */
function calculateEarthRotation(){
    var date = new Date();
    var julian_date = (date / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
    var n = julian_date - 2451545.0;

    var L = 280.460 + 0.9856474*n;
    var g = 357.528 + 0.9856003*n;
    L = (L % 360)*Math.PI/180;
    g = (g % 360)*Math.PI/180;

    var lambda = L + 1.915*Math.sin(g) + 0.020*Math.sin(2*g);
    return lambda-Math.PI/2; //subtracting as tilt around axis perp. to 90 longitude
}

export {
    calculateEarthRotation,
    DataSet
}