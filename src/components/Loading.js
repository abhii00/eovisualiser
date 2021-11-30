import React from 'react';

import logo_earth from '../assets/icons/earth.png';
import logo_sat from '../assets/icons/sat.png';

class Loading extends React.Component {
    render(){
        return(
            this.props.loading ?
            <div className='loading-background'>
                <img src={logo_earth} alt='' className='loading-logo-fixed'/>
                <img src={logo_sat} alt='' className='loading-logo'/>
            </div> : ''
        )
    }
}

export default Loading