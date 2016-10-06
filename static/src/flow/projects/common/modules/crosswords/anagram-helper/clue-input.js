define([
    'react'
], function (
    React
) {
    var ClueInput = React.createClass({

        componentDidMount: function () {
            React.findDOMNode(this).focus();
        },

        componentDidUpdate: function () {
            // focus on reset
            if (this.props.value === '') {
                React.findDOMNode(this).focus();
            }
        },

        onInputChange: function (e) {
            this.props.onChange(e.target.value.toLowerCase());
        },

        onKeyDown: function (e) {
            if (e.keyCode === 13) {
                React.findDOMNode(this).blur();
                this.props.onEnter();
            }
        },

        render: function () {
            return React.createElement('input', {
                type: 'text',
                className: 'crossword__anagram-helper__clue-input',
                placeholder: 'Enter letters',
                maxLength: this.props.clue.length,
                value: this.props.value,
                onChange: this.onInputChange,
                onKeyDown: this.onKeyDown
            });
        }
    });

    return ClueInput;
});
