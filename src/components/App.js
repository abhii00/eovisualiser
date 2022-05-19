import React from 'react';
import * as THREE from 'three';

import { Info, Loading } from './components'

import { createScene, createEnvironment } from '../graphics';
import { DataSet } from '../data';

import test_dataset from '../assets/datasets/test.txt';
import config from '../config.json';

//TODO Optimise dataset loading
//TODO Implement EO dataset functionality
//TODO Implement realistic Earth
//TODO Fix loading screen

class App extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            datapointHovered: ['Hover!'],
            datapointsClicked: ['Click!'],
            loading: true
        }
    }

    componentDidMount() {
        //create scene and environment
        const [scene, camera, renderer] = createScene(new THREE.Vector3(0,0,3));
        this.mount.appendChild(renderer.domElement);
        createEnvironment(scene, camera, renderer);
        
        //choose dataset
        const debug = false;
        const dataset_source = !debug ? config['server']+config['routes']['satellite-tle'] : test_dataset;

        //import dataset
        //eslint-disable-next-line
        var dataset;
        fetch(dataset_source)
        .then(r => r.text())
        .then(text => dataset = new DataSet("satellite-tle", text, 1/6378, scene, camera, renderer, this.updateDisplay))
        .then(this.setState({loading: false}))
    }

    updateDisplay = (a, type) => {
        switch(type){
            case 'hover':
                //replace hovered
                if ([a] !== this.state.datapointHovered){
                    this.setState({
                        datapointHovered: [a]
                    })
                }
                break;

            case 'click-add':
                //add to clicked list
                var dps = this.state.datapointsClicked;
                if (dps[0] === 'Click!'){
                    dps = [];
                }
                dps.push(a)

                this.setState({
                    datapointsClicked: dps
                })
                break;

            case 'click-remove':
                //remove from clicked list
                dps = this.state.datapointsClicked;
                var dp_index = dps.indexOf(a);
                dps.splice(dp_index,1);

                this.setState({
                    datapointsClicked: dps
                })
                break;

            default:
                break;
        }
    }

    render() {
        console.log(this.state.loading)
        return (
            <React.Fragment>
                <Loading loading={this.state.loading}/>
                <div className='app' ref={ref => (this.mount = ref)} >
                    <div className='infos-container'>
                        <Info info={this.state.datapointHovered} style={{backgroundColor: 'rgb(100,0,0)'}}/>
                        <Info info={this.state.datapointsClicked} style={{backgroundColor: 'rgb(0,100,100)', top: '20vh'}}/>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default App