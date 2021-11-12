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
        this.line_material = new THREE.LineBasicMaterial();

        //intersections and interactions
        this.intersects = [];
        this.raycaster = new THREE.Raycaster();
        this.createDataPointInteractions();

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
        var M = 5.9722*10**24;
        var G = 6.674*10**(-11); 
        var mu = G*M;

        for (var i = 0; i < (split_data.length-1)/3; i++){
            var entry = 3*i;

            var record = satellite.twoline2satrec(split_data[entry+1], split_data[entry+2])
            var posvel_eci = satellite.propagate(record, date);
            if (posvel_eci.position !== undefined){
                //POINT
                //calculate eci position
                var pos_eci = posvel_eci.position;
                var pos_three_eci = new THREE.Vector3(pos_eci.x, pos_eci.z, pos_eci.y); //need to swap y and z axis i.e. x-z plane is plane of earth
                pos_three_eci.multiplyScalar(this.scale_factor);

                //calculate ecf position
                var pos_ecf = satellite.eciToEcf(pos_eci, convertDate('gmst'));
                var pos_three_ecf = new THREE.Vector3(pos_ecf.x, pos_ecf.z, pos_ecf.y);
                pos_three_ecf.multiplyScalar(this.scale_factor);

                //plot in eci
                const mesh_point = new THREE.Mesh(this.sphere_geometry,this.sphere_material.clone());
                mesh_point.position.copy(pos_three_eci);
                mesh_point.name = split_data[entry];
                
                //color mesh
                if (Math.abs(pos_three_ecf.z) < 0.05) {mesh_point.material.color = new THREE.Color(0xff0000)} //red on prime meridian
                else if (Math.abs(pos_three_eci.z) < 0.05) {mesh_point.material.color = new THREE.Color(0x00ff00)} //green on vernal equinox
                else {mesh_point.material.color = new THREE.Color(0xffffff)}

                //ORBIT
                //calculate orbital parameters
                var points = [];
                const resolution = 75;
                var a = Math.cbrt(mu/(record.no/60)**2) * 10**(-3) * this.scale_factor;
                var b = a*Math.sqrt(1-record.ecco**2);
                var c = Math.sqrt(a^2 - b^2);

                //calculate orbit
                for (var j = 0; j <= resolution; j++){
                    var ecc_anom = j * 2 * Math.PI/resolution;
                    var point = new THREE.Vector3(a*Math.cos(ecc_anom), 0.0, b*Math.sin(ecc_anom));
                    /*
                    var nodeo_rot = new THREE.Euler(0,record.nodeo-Math.PI/2,0);
                    var inclo_rot = new THREE.Euler(record.inclo, 0, 0);
                    var argpo_rot = new THREE.Euler(0,record.argpo,0);                    
                    point.applyEuler(nodeo_rot);
                    point.applyEuler(inclo_rot);
                    point.applyEuler(argpo_rot);
                    */
                    points.push(point);
                }
                const orbit_geometry = new THREE.BufferGeometry().setFromPoints(points);
                const mesh_orbit = new THREE.Line(orbit_geometry,this.line_material);

                //ADD
                var datapoint = new ECIDataPoint(mesh_point, mesh_orbit);
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
     * Updates the intersects of the mouse
     * @param e the event on which to trigger 
     * @returns an array of the objects intersected
     */
    updateIntersects(e){
        this.raycaster.setFromCamera(updateMousePosition(e), this.camera);
        return this.raycaster.intersectObjects(this.scene.children);
    }

    /**
     * Highlights a datapoint object on hover
     * @param e the event on which to trigger
     */
    hoverDataPoints(e){
        //undo previous hover
        for (var intersect of this.intersects){
            var datapoint = this.datapoints[intersect];
            datapoint.toggleHovered();
        }
        this.intersects.length = 0;
        
        //get mouse position and raycaster intersects
        const new_intersects = this.updateIntersects(e);

        //do new hover
        for (var new_intersect of new_intersects){
            if (new_intersect.object.name !== ''){
                var new_datapoint = this.datapoints[new_intersect.object.name];
                new_datapoint.toggleHovered();

                this.intersects.push(new_intersect.object.name);
            }
        }

        //change to pointer
        if (this.intersects.length > 0){ 
            document.body.style.cursor = 'pointer';
         } 
        else { 
            document.body.style.cursor = 'default' ;
        }
    }

    /**
     * Permanently highlights a datapoint object on click
     * @param e the event on which to trigger
     */
    clickDataPoints(e){      
        //get mouse position and raycaster intersects
        const new_intersects = this.updateIntersects(e);

        //do click
        for (var new_intersect of new_intersects){
            if (new_intersect.object.name !== ''){
                var datapoint = this.datapoints[new_intersect.object.name];
                datapoint.clicked ? this.scene.remove(datapoint.mesh2) : this.scene.add(datapoint.mesh2)
                datapoint.toggleClicked();
            }
        }
    }

    /**
     * Creates all the user interactions for the dataset into the scene
     */
    createDataPointInteractions(){
        const click = (e) => {this.clickDataPoints(e); this.hoverDataPoints(e)};
        const hover = (e) => this.hoverDataPoints(e);

        window.addEventListener('mousemove',hover,false); 
        window.addEventListener('mousedown',click,false);
    }
}

/**
 * An individual ECI datapoint
 * @param mesh the object for the point
 * @param mesh2 a secondary object that is shown on click
 */
class ECIDataPoint{
    constructor(mesh, mesh2){
        this.mesh = mesh;
        this.mesh2 = mesh2;

        this.hovered = false;
        this.clicked = false;
    }

    /**
     * Toggles hovering state
     */
    toggleHovered(){
        this.hovered = !this.hovered;

        if (!this.clicked){
            if (this.hovered){
                this.mesh.material.color.set(0xff0000);
            }
            else {
                this.mesh.material.color.set(0xffffff);
            }
        }
    }

    /**
     * Toggles clicking state
     */
    toggleClicked(){
        this.clicked = !this.clicked;

        if (this.clicked){
            this.mesh.material.color.set(0x0000ff);
            this.mesh.scale.set(2,2,2);
        }
        else {
            this.mesh.scale.set(1,1,1);
        }
    }
}

export {
    DataSet,
    ECIDataPoint
}