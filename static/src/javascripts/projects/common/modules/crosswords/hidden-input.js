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
                fastdom.read(function () {
                    var offsets = bonzo(React.findDOMNode(this.refs.input)).offset();
                    scroller.scrollTo(offsets.top - offsets.height * 1.5 - $('.crossword__sticky-clue').offset().height, 250, 'easeOutQuad');
                }.bind(this));
            }
        },

        handleChange: function (event) {
            this.props.crossword.insertCharacter(event.target.value.toUpperCase());
            this.setState({
                value: ''
            });
        },

        onClick: function (event) {
            this.props.crossword.onClickHiddenInput(event);
        },

        touchStart: function (event) {
           this.props.crossword.onClickHiddenInput(event);
        },

        onKeyDown: function(event) {
          this.props.crossword.onKeyDown(event);
        },

        onBlur: function(event) {
          this.props.crossword.goToReturnPosition(event);
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
                    onClick: this.onClick,
                    onChange: this.handleChange,
                    onTouchStart: this.touchStart,
                    onKeyDown: this.onKeyDown,
                    onBlur: this.onBlur,
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
