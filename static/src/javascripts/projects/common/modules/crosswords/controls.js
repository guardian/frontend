define([
    'react'
], function (React) {
    var buttonClassName = 'button button--small';

    return React.createClass({
        render: function () {
            var focussedControls = [
                React.DOM.button({
                    className: buttonClassName,
                    onClick: this.props.onCheck,
                    key: 'check'
                }, 'Check'),
                React.DOM.button({
                    className: buttonClassName,
                    onClick: this.props.onCheat,
                    key: 'cheat'
                }, 'Cheat')
            ], omnipresentControls = [
                React.DOM.button({
                    className: buttonClassName,
                    onClick: this.props.onCheckAll,
                    key: 'checkAll'
                }, 'Check all'),
                React.DOM.button({
                    className: buttonClassName,
                    onClick: this.props.onSolution,
                    key: 'solution'
                }, 'Solution'),
                React.DOM.button({
                    className: buttonClassName,
                    onClick: this.props.onClearAll,
                    key: 'clear'
                }, 'Clear')
            ];

            return React.DOM.div({
                className: 'crossword__controls'
            },
                this.props.clueInFocus ? focussedControls.concat(omnipresentControls) : omnipresentControls
            )
        }
    });
});
