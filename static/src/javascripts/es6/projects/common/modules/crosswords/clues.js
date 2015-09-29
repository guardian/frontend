/* eslint new-cap: 0 */

import classNames from 'classnames';
import React from 'react';

import _ from 'common/utils/_';

class Clue extends React.Component {

    constructor (props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick () {
        this.props.setReturnPosition();
    }

    render () {
        return (
            <li>
                <a href={`#${this.props.id}`}
                   onClick={this.onClick}
                   className={classNames({
                    'crossword__clue': true,
                    'crossword__clue--answered': this.props.hasAnswered,
                    'crossword__clue--selected': this.props.isSelected,
                    'crossword__clue--display-group-order' : JSON.stringify(this.props.number) !== this.props.humanNumber
                })}>
                    <div className="crossword__clue__number">{this.props.humanNumber}</div>

                    <div className="crossword__clue__text"
                       /* jscs:disable disallowDanglingUnderscores */
                       dangerouslySetInnerHTML={{__html: this.props.clue}}
                       /* jscs:enable disallowDanglingUnderscores */
                    ></div>
                </a>
            </li>
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
                    id={clue.entry.id}
                    key={clue.entry.id}
                    number={clue.entry.number}
                    humanNumber={clue.entry.humanNumber}
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

