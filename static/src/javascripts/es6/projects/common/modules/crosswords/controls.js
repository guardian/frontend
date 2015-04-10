import classNames from 'classnames';
import React from 'react';

const buttonClassName = 'button button--small';
const buttonCurrentClassName = 'button--crossword--current';
const buttonGenericClassName = 'button--secondary';

export default React.createClass({
    render () {
        const hasSolutions = this.props.hasSolutions;
        const hasFocus = this.props.clueInFocus;
        const controls = [];

        if (hasFocus && hasSolutions) {
            controls.unshift(
                React.DOM.button({
                    className: `${buttonClassName} ${buttonCurrentClassName}`,
                    onClick: this.props.onCheck,
                    key: 'check'
                }, 'Check this')
            );

            controls.unshift(
                React.DOM.button({
                    className: `${buttonClassName} ${buttonCurrentClassName}`,
                    onClick: this.props.onCheat,
                    key: 'cheat'
                }, 'Reveal this')
            );
        }

        if (hasSolutions) {
            controls.unshift(
                React.DOM.button({
                    className: `${buttonClassName} ${buttonGenericClassName}`,
                    onClick: this.props.onCheckAll,
                    key: 'checkAll'
                }, 'Check all')
            );

            controls.unshift(
                React.DOM.button({
                    className: `${buttonClassName} ${buttonGenericClassName}`,
                    onClick: this.props.onSolution,
                    key: 'solution'
                }, 'Reveal all')
            );
        }

        controls.unshift(
            React.DOM.button({
                className: `${buttonClassName} ${buttonGenericClassName}`,
                onClick: this.props.onClearAll,
                key: 'clear'
            }, 'Clear all')
        );

        return React.DOM.div({
            className: 'crossword__controls'
        },
            controls
        );
    }
});

