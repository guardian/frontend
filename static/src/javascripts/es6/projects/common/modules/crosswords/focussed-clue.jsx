import React from 'react';
import classNames from 'classnames';

export default React.createClass({
    render () {
        if(this.props.focussedClue === null) {return false}

        const classList = {
            'crossword__focussed-clue--direction': true,
            'crossword__focussed-clue--direction-down': this.props.focussedClue.direction === 'down',
            'crossword__focussed-clue--direction-across': this.props.focussedClue.direction === 'across'
        };
        return <div className='crossword__focussed-clue-wrapper'>
            <div className='crossword__focussed-clue'>
                <div className={classNames(classList)}>{this.props.focussedClue.number} {this.props.focussedClue.direction}</div>
                {this.props.focussedClue.clue}
            </div>
            {this.props.intersectingEntries.map((intersectingEntry) => {
                const classList = {
                    'crossword__contextual-clue--direction': true,
                    'crossword__contextual-clue--direction-down': intersectingEntry.direction === 'down',
                    'crossword__contextual-clue--direction-across': intersectingEntry.direction === 'across'
                };
                const focusClue = () =>
                    this.props.focusClue(intersectingEntry.position.x,
                                         intersectingEntry.position.y,
                                         intersectingEntry.direction);
                return <button className='crossword__contextual-clue u-button-reset'
                               onClick={focusClue}>
                    <div className={classNames(classList)}>{intersectingEntry.number} {intersectingEntry.direction}</div>
                    {intersectingEntry.clue}
                </button>;
            })}
        </div>;
    }
});

