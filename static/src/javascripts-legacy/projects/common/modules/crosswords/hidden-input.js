define([
    'react/addons',
    'bonzo',
    'fastdom',
    'lib/$',
    'lib/scroller',
    'lib/detect'
], function (
    React,
    bonzo,
    fastdom,
    $,
    scroller,
    detect
) {
    var HiddenInput = React.createClass({

        getInitialState: function () {
            return {
                value: this.props.value
            };
        },

        componentDidUpdate: function () {
            if (detect.isBreakpoint({
                    max: 'mobile'
                })) {
                fastdom.measure(function () {
                    var offsets = bonzo(React.findDOMNode(this.refs.input)).offset();
                    scroller.scrollTo(offsets.top - offsets.height * 1.5 - $('.crossword__sticky-clue').offset().height, 250, 'easeOutQuad');
                }.bind(this));
            }
        },

        handleChange: function (event) {
            this.props.onChange(event.target.value.toUpperCase());
            this.setState({
                value: ''
            });
        },

        render: function () {
            return React.createElement(
                'div', {
                    className: 'crossword__hidden-input-wrapper',
                    ref: 'wrapper'
                },
                React.createElement('input', {
                    type: 'text',
                    className: 'crossword__hidden-input',
                    maxLength: '1',
                    onClick: this.props.onClick,
                    onChange: this.handleChange,
                    onTouchStart: this.props.touchStart,
                    onKeyDown: this.props.onKeyDown,
                    onBlur: this.props.onBlur,
                    value: this.state.value,
                    autoComplete: 'off',
                    spellCheck: 'false',
                    autoCorrect: 'off',
                    ref: 'input'
                })
            );
        }
    });

    return HiddenInput;
});
