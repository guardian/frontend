/* eslint new-cap: 0 */

import classNames from 'classnames';
import React from 'react';

import _ from 'common/utils/_';

class Clue extends React.Component {

    constructor (props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick (event) {
        event.preventDefault();
        this.props.setReturnPosition();
        this.props.focusClue();
    }

    render () {
        return (
            <li className={classNames({
                    'crossword__clue': true,
                    'crossword__clue--answered': this.props.hasAnswered,
                    'crossword__clue--selected': this.props.isSelected
                })}
                onClick={this.onClick}
                value={parseInt(this.props.number, 10)}
                dangerouslySetInnerHTML={{__html: this.props.clue}}
            />
        );
    }
}

export default class Clues extends React.Component {

    render () {
        const headerClass = 'crossword__clues-header';
        const cluesByDirection = (direction) => _.chain(this.props.clues)
            .filter((clue) => clue.entry.direction === direction)
            .map((clue) =>
                <Clue
                    key={clue.entry.clue}
                    number={clue.entry.number + '.'}
                    clue={clue.entry.clue}
                    hasAnswered={clue.hasAnswered}
                    isSelected={clue.isSelected}
                    focusClue={() => {
                        this.props.focusClue(clue.entry.position.x, clue.entry.position.y, direction);
                    }}
                    setReturnPosition={() => {
                        this.props.setReturnPosition(window.scrollY);
                    }}
                />
            );

        return (
            <div className='crossword__clues'>
                <div className='crossword__clues--across'>
                    <h3 className={headerClass}>Across</h3>
                    <ol className='crossword__clues-list'>
                        {cluesByDirection('across')}
                    </ol>
                </div>
                <div className='crossword__clues--down'>
                    <h3 className={headerClass}>Down</h3>
                    <ol className='crossword__clues-list'>
                        {cluesByDirection('down')}
                    </ol>
                </div>
            </div>
        );
    }
}

