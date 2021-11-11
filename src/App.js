import React from 'react';
import * as THREE from 'three';

import { createScene, createEnvironment } from './graphics';
import { DataSet } from './data';

import test_dataset from './assets/datasets/test.txt';

class App extends React.Component {
    /* 
    FIXME Day-night cycle of Earth
    TODO Add API request to portfolioserver
    TODO Add clickable elements
    TODO Add orbit visualisation
    */

    componentDidMount() {
        const [scene, camera, renderer] = createScene(new THREE.Vector3(0,0,3));
        this.mount.appendChild(renderer.domElement);
        createEnvironment(scene, camera, renderer);
        
        /* eslint-disable no-unused-vars */
        var test;
        fetch(test_dataset)
        .then(r => r.text())
        .then(text => test = new DataSet("satellite-tle", text, 1/6378, scene, camera, renderer))
    }

    render() {
        return (
            <div className='app' ref={ref => (this.mount = ref)} />
        )
    }
}

export default App