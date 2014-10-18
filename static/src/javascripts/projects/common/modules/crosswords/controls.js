define([
    'react'
], function (React) {
    var buttonClassName = "button button--small";

    return React.createClass({
        render: function () {
            var focussedControls = [
                React.DOM.button({
                    className: buttonClassName,
                    onClick: this.props.onCheck
                }, "Check"),
                React.DOM.button({
                    className: buttonClassName,
                    onClick: this.props.onCheat
                }, "Cheat")
            ], omnipresentControls = [
                React.DOM.button({
                    className: buttonClassName,
                    onClick: this.props.onCheckAll
                }, "Check all"),
                React.DOM.button({
                    className: buttonClassName,
                    onClick: this.props.onSolution
                }, "Solution")
            ];

            return React.DOM.div({
                    className: "crossword__controls"
                },
                this.props.clueInFocus ? focussedControls.concat(omnipresentControls) : omnipresentControls
            )
        }
    });
});
