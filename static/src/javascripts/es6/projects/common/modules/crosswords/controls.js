import React from 'react';

import ConfirmButton from './confirm-button';

const buttonClassName = 'button button--primary';
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
            <ConfirmButton className={`${buttonClassName} ${buttonGenericClassName}`}
                onClick={this.props.onClearAll}
                key='clear'
                text='Clear all'>
            </ConfirmButton>
        );

        if (hasSolutions) {
            controls.grid.unshift(
                <ConfirmButton className={`${buttonClassName} ${buttonGenericClassName}`}
                    onClick={this.props.onSolution}
                    key='solution'
                    text='Reveal all'>
                </ConfirmButton>
            );
            controls.grid.unshift(
                <ConfirmButton className={`${buttonClassName} ${buttonGenericClassName}`}
                    onClick={this.props.onCheckAll}
                    key='checkAll'
                    text='Check all'>
                </ConfirmButton>
            );
        }

        // HIGHLIGHTED CLUE CONTROLS
        if (hasFocus && hasSolutions) {
            controls.clue.unshift(
                <button className={`${buttonClassName} ${buttonCurrentClassName}`}
                    onClick={this.props.onClearSingle}
                    key='clear-single'>
                    Clear this
                </button>
            );

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

            // anagram helper
            controls.clue.push(
                <button className={`${buttonClassName} ${buttonCurrentClassName}`}
                    onClick={this.props.onToggleAnagramHelper}
                    key='anagram'>
                    Anagram helper
                </button>
            );
        }

        return (
            <div className='crossword__controls'>
                <div className='crossword__controls__clue'>{controls.clue}</div>
                <div className='crossword__controls__grid'>{controls.grid}</div>
                <div className='crossword__controls_autosave_label'>Crosswords are saved automatically</div>
            </div>
        );
    }
}
