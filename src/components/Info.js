import React from 'react';

class Info extends React.Component {
    render(){
        var display_info = [];
        for (var info of this.props.info){
            display_info.push(<div className='info-text'>{info}</div>)
        }

        return(
            <div className='info-container' style={this.props.style}>
                {display_info}
            </div>
        )
    }
}

export default Info