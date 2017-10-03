import React from 'react/addons';
import bonzo from 'bonzo';
import fastdom from 'fastdom';
import $ from 'lib/$';
import scroller from 'lib/scroller';
import detect from 'lib/detect';
const HiddenInput = React.createClass({

    getInitialState() {
        return {
            value: this.props.value
        };
    },

    componentDidUpdate() {
        if (detect.isBreakpoint({
                max: 'mobile'
            })) {
            fastdom.read(() => {
                const offsets = bonzo(React.findDOMNode(this.refs.input)).offset();
                scroller.scrollTo(offsets.top - offsets.height * 1.5 - $('.crossword__sticky-clue').offset().height, 250, 'easeOutQuad');
            });
        }
    },

    handleChange(event) {
        this.props.crossword.insertCharacter(event.target.value.toUpperCase());
        this.setState({
            value: ''
        });
    },

    onClick(event) {
        this.props.crossword.onClickHiddenInput(event);
    },

    touchStart(event) {
        this.props.crossword.onClickHiddenInput(event);
    },

    onKeyDown(event) {
        this.props.crossword.onKeyDown(event);
    },

    onBlur(event) {
        this.props.crossword.goToReturnPosition(event);
    },

    render() {
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

export default HiddenInput;
