import React from 'react';

const buttonClassName = 'button button--small';
const buttonCurrentClassName = 'button--crossword--current';
const buttonGenericClassName = 'button--secondary';

export default class Controls extends React.Component {

    render () {
        const hasSolutions = this.props.hasSolutions;
        const hasFocus = this.props.clueInFocus;
        const controls = {
            clue: [],
            grid: []
        };

        // GRID CONTROLS
        controls.grid.unshift(
            <button className={`${buttonClassName} ${buttonGenericClassName}`}
                onClick={this.props.onClearAll}
                key='clear'>
                Clear all
            </button>
        );

        if (hasSolutions) {
            controls.grid.unshift(
                <button className={`${buttonClassName} ${buttonGenericClassName}`}
                    onClick={this.props.onSolution}
                    key='solution'>
                    Reveal all
                </button>
            );
            controls.grid.unshift(
                <button className={`${buttonClassName} ${buttonGenericClassName}`}
                    onClick={this.props.onCheckAll}
                    key='checkAll'>
                    Check all
                </button>
            );
        }

        // HIGHLIGHTED CLUE CONTROLS
        if (hasFocus && hasSolutions) {
            controls.clue.unshift(
                <button className={`${buttonClassName} ${buttonCurrentClassName}`}
                    onClick={this.props.onCheat}
                    key='cheat'>
                    Reveal this
                </button>
            );
            controls.clue.unshift(
                <button className={`${buttonClassName} ${buttonCurrentClassName}`}
                    onClick={this.props.onCheck}
                    key='check'>
                    Check this
                </button>
            );
        }
        // anagram helper
        controls.clue.push(
            <button className={`${buttonClassName} ${buttonCurrentClassName}`}
                onClick={this.props.onToggleAnagramHelper}
                key='anagram'>
                Anagram helper
            </button>
        );

        return (
            <div className='crossword__controls'>
                <div className='crossword__controls__clue'>{controls.clue}</div>
                <div className='crossword__controls__grid'>{controls.grid}</div>
            </div>
        );
    }
}
