define([
    'react'
], function (React) {
    var buttonClassName = 'button button--small';

    return React.createClass({
        render: function () {
            var hasSolutions = this.props.hasSolutions,
                hasFocus = this.props.clueInFocus,
                controls = [];

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
});
