import * as THREE from "three";
import * as satellite from "satellite.js";
import { Vector3 } from "three";

/**
 * A Dataset
 * @param type the type of dataset, currently supports: satellite-tle
 * @param raw the raw dataset
 */
class DataSet{
    constructor(type, raw){
        this.type = type
        this.raw_data = raw
        this.datapoints = []

        this.geometry = {
            sphere: new THREE.SphereBufferGeometry(0.05, 5, 5)
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
     * Processes TLE data and creates datapoints 
     */
    processTLE(){
        var split_data = this.raw_data.split(/\r?\n/);
        const date = new Date();
        const gmst = satellite.gstime(date);

        for (var i = 0; i < (split_data.length-1)/3; i++){
            var entry = 3*i;

            var record = satellite.twoline2satrec(split_data[entry+1], split_data[entry+2])
            var posvel = satellite.propagate(record, date);
            var pos = satellite.eciToGeodetic(posvel.position, gmst);
            
            this.datapoints.push(new DataPoint(split_data[entry], pos, "polar", this.geometry.sphere));
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
 * An individual datapoint
 * @param id a unique id for the point
 * @param position the position of the point
 * @param position_type the type of position passed into the object, currently supports: cartesian, polar 
 * @param geometry the geometry object for the point
 */
class DataPoint{
    constructor(id, position, position_type, geometry){
        this.id = id;
        this.position = position;
        this.position_type = position_type;
        this.geometry = geometry;

        switch(this.position_type){
            case "cartesian":
                break;
            case "polar":
                var r = position.height*10**-3;
                var lat = position.latitude;
                var long = position.longitude;
                this.position = new Vector3(r*Math.cos(lat)*Math.cos(long), r*Math.sin(lat), r*Math.cos(lat)*Math.sin(long))
                break;
            default:
                break;
        }

        this.createPoint();
    }

    /**
     * Creates the spherical mesh for a point
     */
    createPoint(){
        this.sphere_material = new THREE.MeshBasicMaterial();
        this.sphere = new THREE.Mesh(this.geometry, this.sphere_material);
        this.sphere.position.copy(this.position);
    }
}

export {
    DataSet,
    DataPoint
}