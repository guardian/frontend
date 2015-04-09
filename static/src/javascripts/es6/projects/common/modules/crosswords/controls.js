import React from 'react';

const buttonClassName = 'button button--small';

export default React.createClass({
    render () {
        const hasSolutions = this.props.hasSolutions;
        const hasFocus = this.props.clueInFocus;
        const controls = [];

        if (hasFocus && hasSolutions) {
            controls.unshift(
                React.DOM.button({
                    className: buttonClassName,
                    onClick: this.props.onCheck,
                    key: 'check'
                }, 'Check')
            );

            controls.unshift(
                React.DOM.button({
                    className: buttonClassName,
                    onClick: this.props.onCheat,
                    key: 'cheat'
                }, 'Cheat')
            );
        }

        if (hasSolutions) {
            controls.unshift(
                React.DOM.button({
                    className: buttonClassName,
                    onClick: this.props.onCheckAll,
                    key: 'checkAll'
                }, 'Check all')
            );

            controls.unshift(
                React.DOM.button({
                    className: buttonClassName,
                    onClick: this.props.onSolution,
                    key: 'solution'
                }, 'Solution')
            );
        }

        controls.unshift(
            React.DOM.button({
                className: buttonClassName,
                onClick: this.props.onClearAll,
                key: 'clear'
            }, 'Clear')
        );

        return React.DOM.div({
            className: 'crossword__controls'
        },
            controls
        );
    }
});

