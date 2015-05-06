import classNames from 'classnames';
import React from 'react';

const buttonClassName = 'button button--small';
const buttonCurrentClassName = 'button--crossword--current';
const buttonGenericClassName = 'button--secondary';

export default class extends React.Component {

    render () {
        const hasSolutions = this.props.hasSolutions;
        const hasFocus = this.props.clueInFocus;
        const controls = [];

        if (hasFocus && hasSolutions) {
            controls.unshift(
                <button className={`${buttonClassName} ${buttonCurrentClassName}`}
                    onClick={this.props.onCheck}
                    key='check'>
                    Check this
                </button>
            );

            controls.unshift(
                <button className={`${buttonClassName} ${buttonCurrentClassName}`}
                    onClick={this.props.onCheat}
                    key='cheat'>
                    Reveal this
                </button>
            );
        }

        if (hasSolutions) {
            controls.unshift(
                <button className={`${buttonClassName} ${buttonGenericClassName}`}
                    onClick={this.props.onCheckAll}
                    key='checkAll'>
                    Check all
                </button>
            );

            controls.unshift(
                <button className={`${buttonClassName} ${buttonGenericClassName}`}
                    onClick={this.props.onSolution}
                    key='solution'>
                    Reveal all
                </button>
            );
        }

        controls.unshift(
            <button className={`${buttonClassName} ${buttonGenericClassName}`}
                onClick={this.props.onClearAll}
                key='clear'>
                Clear all
            </button>
        );

        return <div className='crossword__controls'>{controls}</div>;
    }
};
