import React from 'react';
import * as THREE from 'three';
import { setupScene, createEnvironment } from './graphics.js';

class App extends React.Component {
    componentDidMount() {
        const [scene, camera, renderer,] = setupScene(new THREE.Vector3(0,0,3));
        this.mount.appendChild(renderer.domElement);
        createEnvironment(scene, camera, renderer);
    }

    render() {
        return (
            <div className='app' ref={ref => (this.mount = ref)} />
        )
    }
}

export default App