import * as THREE from "three";
import * as satellite from "satellite.js";

/**
 * A Dataset
 * @param type the type of dataset, currently supports: satellite-tle
 * @param raw the raw dataset
 * @param scale_factor the scaling factor for display
 */
class DataSet{
    constructor(type, raw, scale_factor){
        this.type = type
        this.raw_data = raw
        this.scale_factor = scale_factor
        this.datapoints = []

        this.geometry = {
            sphere: new THREE.SphereBufferGeometry(0.03, 2, 2),
            big_sphere: new THREE.SphereBufferGeometry(0.1, 3, 3)
        }

        switch(this.type){
            case "blank":
                break;
            case "satellite-tle":
                this.processTLE();
                break;
            default:
                break;
        }
    }

    /**
     * Processes large TLE data and creates ECI datapoints 
     */
    processTLE(){
        var split_data = this.raw_data.split(/\r?\n/);
        const date = new Date();

        for (var i = 0; i < (split_data.length-1)/3; i++){
            var entry = 3*i;

            var record = satellite.twoline2satrec(split_data[entry+1], split_data[entry+2])
            var posvel = satellite.propagate(record, date);
            var pos = new THREE.Vector3(this.scale_factor*posvel.position.x, this.scale_factor*posvel.position.z, this.scale_factor*posvel.position.y)
            
            if (Math.abs(pos.x) < 0.05){
                this.datapoints.push(new ECIDataPoint(split_data[entry], pos, this.geometry.big_sphere, new THREE.Color(0xff0000)));
            }
            else if (Math.abs(pos.y) < 0.05){
                this.datapoints.push(new ECIDataPoint(split_data[entry], pos, this.geometry.big_sphere, new THREE.Color(0x0000ff)));
            }
            else if (Math.abs(pos.z) < 0.05){
                this.datapoints.push(new ECIDataPoint(split_data[entry], pos, this.geometry.big_sphere, new THREE.Color(0x00ff00)));
            }
            else{
                this.datapoints.push(new ECIDataPoint(split_data[entry], pos, this.geometry.sphere, new THREE.Color(0xffffff)));
            }
        }
    }

    /**
     * Renders the data points for the dataset into a scene
     * @param scene the scene in which to render the datapoints
     */
    renderDataPoints(scene){
        for (var datapoint of this.datapoints){
            scene.add(datapoint.sphere)
        }
        console.log(this.datapoints)
    }
}

/**
 * An individual ECI datapoint
 * @param id a unique id for the point
 * @param position the position of the point in ECI coordinates
 * @param geometry the geometry object for the point
 * @param color the color for the point
 */
class ECIDataPoint{
    constructor(id, position, geometry, color){
        this.id = id;
        this.position = position;
        this.geometry = geometry;
        this.color = color;

        this.createPoint();
    }

    /**
     * Creates the spherical mesh for a point
     */
    createPoint(){
        this.sphere_material = new THREE.MeshBasicMaterial({color: this.color});
        this.sphere = new THREE.Mesh(this.geometry, this.sphere_material);
        this.sphere.position.copy(this.position);
    }
}

export {
    DataSet
}