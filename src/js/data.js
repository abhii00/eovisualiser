import * as THREE from "three";

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

        for (var i = 0; i < (split_data.length-1)/3; i++){
            var entry = 3*i;
            var line_0 = split_data[entry];
            var line_1 = split_data[entry+1].split(/\s+/g);
            var line_2 = split_data[entry+2].split(/\s+/g);

            var name = line_0;
            var orbital_elements = {
                "epoch year": line_1[6],
                "epoch day": line_1[7],
                "inclination": line_2[2],
                "right ascension": line_2[3],
                "eccentricity": line_2[4],
                "argument of perigee": line_2[5],
                "mean anomaly": line_2[6],
                "mean motion": line_2[7]
            };

            console.log(orbital_elements)

            this.datapoints.push(new DataPoint(name, orbital_elements, "orbital"));
        }
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
                this.orbitaltoCartesian();
                break;
            default:
                break;
        }

        this.createPoint();
    }

    orbitaltoCartesian(){
    }

    createPoint(){
        this.sphere_geometry = new THREE.SphereGeometry(0.01, 5, 5);
        this.sphere_material = new THREE.MeshBasicMaterial();
        this.sphere = new THREE.Mesh(this.sphere_geometry, this.sphere_material);
        this.sphere.position.copy(this.position);
    }
}

export {
    DataSet,
    DataPoint
}