import * as THREE from "three";
import * as satellite from "satellite.js";
import { Vector3 } from "three";

class DataSet{
    constructor(type, raw){
        this.type = type
        this.raw_data = raw
        this.datapoints = []

        switch(this.type){
            case "blank":
                break;
            case "tle":
                this.processTLE();
                break;
            default:
                break;
        }
    }

    processTLE(){
        var split_data = this.raw_data.split(/\r?\n/);
        const date = new Date();
        const gmst = satellite.gstime(date);

        for (var i = 0; i < (split_data.length-1)/3; i++){
            var entry = 3*i;

            var record = satellite.twoline2satrec(split_data[entry+1], split_data[entry+2])
            var posvel = satellite.propagate(record, date);
            var pos = satellite.eciToGeodetic(posvel.position, gmst);
            
            this.datapoints.push(new DataPoint(split_data[entry], pos, "polar"));
        }
    }

    renderDataPoints(scene){
        for (var datapoint of this.datapoints){
            scene.add(datapoint.sphere)
        }
        console.log(this.datapoints)
    }
}

class DataPoint{
    constructor(id, position, position_type){
        this.id = id;
        this.position = position;
        this.position_type = position_type

        switch(this.position_type){
            case "cartesian":
                break;
            case "orbital":
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

    createPoint(){
        this.sphere_geometry = new THREE.SphereGeometry(0.1, 5, 5);
        this.sphere_material = new THREE.MeshBasicMaterial();
        this.sphere = new THREE.Mesh(this.sphere_geometry, this.sphere_material);
        this.sphere.position.copy(this.position);
    }
}

export {
    DataSet,
    DataPoint
}