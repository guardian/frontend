import React from 'react';
import classNames from 'classnames';

export default React.createClass({
    render: function () {
        if(this.props.clueText === null) {return false}

        let classes = {
            'crossword__focussed-clue--direction': true,
            'crossword__focussed-clue--direction-down': this.props.clueText.direction === 'down',
            'crossword__focussed-clue--direction-across': this.props.clueText.direction === 'across'
        };
        return <div className='crossword__focussed-clue-wrapper'>
            <div className={classNames(classes)}>{this.props.clueText.number} {this.props.clueText.direction}</div>
            <div className='crossword__focussed-clue'>{this.props.clueText.clue}</div>
        </div>;
    }
});

