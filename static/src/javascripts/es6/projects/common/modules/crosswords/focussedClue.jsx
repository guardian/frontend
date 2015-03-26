import React from 'react';

export default React.createClass({
    render: function () {
        console.log(this.props);
        return <div className='crossword__focussed-clue-wrapper'>
            <div className='crossword__focussed-clue'>{this.props.clueText}</div>
        </div>;
    }
});

