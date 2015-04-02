import React from 'react';
import classNames from 'classnames';

export default React.createClass({
    render: function () {
        if(this.props.focussedClue === null) {return false}

        let classList = {
            'crossword__focussed-clue--direction': true,
            'crossword__focussed-clue--direction-down': this.props.focussedClue.direction === 'down',
            'crossword__focussed-clue--direction-across': this.props.focussedClue.direction === 'across'
        };
        return <div className='crossword__focussed-clue-wrapper'>
            <div className='crossword__focussed-clue'>
                <div className={classNames(classList)}>{this.props.focussedClue.number} {this.props.focussedClue.direction}</div>
                {this.props.focussedClue.clue}
            </div>
            {this.props.contextualClues.map((contextualClue) => {
                let classList = {
                    'crossword__contextual-clue--direction': true,
                    'crossword__contextual-clue--direction-down': contextualClue.direction === 'down',
                    'crossword__contextual-clue--direction-across': contextualClue.direction === 'across'
                };
                let focusClue = () => {
                    this.props.focusClue(contextualClue.position.x,
                                         contextualClue.position.y,
                                         contextualClue.direction)
                };
                return <button className='crossword__contextual-clue u-button-reset'
                               onClick={focusClue}>
                    <div className={classNames(classList)}>{contextualClue.number} {contextualClue.direction}</div>
                    {contextualClue.clue}
                </button>;
            })}
        </div>;
    }
});

