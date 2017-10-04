// @flow
import { createClass, createElement, findDOMNode } from 'react/addons';
import bonzo from 'bonzo';
import fastdom from 'fastdom';
import { scrollTo } from 'lib/scroller';
import { isBreakpoint } from 'lib/detect';

const HiddenInput = createClass({
    getInitialState() {
        return {
            value: this.props.value,
        };
    },

    componentDidUpdate() {
        if (
            isBreakpoint({
                max: 'mobile',
            })
        ) {
            fastdom.read(() => {
                const offsets = bonzo(findDOMNode(this.refs.input)).offset();
                const clueHeight = document.getElementsByClassName(
                    'crossword__sticky-clue'
                )[0].offsetHeight;

                scrollTo(
                    offsets.top - offsets.height * 1.5 - clueHeight,
                    250,
                    'easeOutQuad'
                );
            });
        }
    },

    handleChange(event: SyntheticInputEvent<HTMLInputElement>) {
        this.props.crossword.insertCharacter(event.target.value.toUpperCase());
        this.setState({
            value: '',
        });
    },

    onClick(event: SyntheticInputEvent<HTMLInputElement>) {
        this.props.crossword.onClickHiddenInput(event);
    },

    touchStart(event: SyntheticInputEvent<HTMLInputElement>) {
        this.props.crossword.onClickHiddenInput(event);
    },

    onKeyDown(event: SyntheticInputEvent<HTMLInputElement>) {
        this.props.crossword.onKeyDown(event);
    },

    onBlur(event: SyntheticInputEvent<HTMLInputElement>) {
        this.props.crossword.goToReturnPosition(event);
    },

    render() {
        return createElement(
            'div',
            {
                className: 'crossword__hidden-input-wrapper',
                ref: 'wrapper',
            },
            createElement('input', {
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
                ref: 'input',
            })
        );
    },
});

export { HiddenInput };
