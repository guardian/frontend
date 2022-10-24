import React, { Component, findDOMNode } from 'preact/compat';
import bonzo from 'bonzo';
import fastdom from 'fastdom';
import { scrollTo } from 'lib/scroller';
import { isBreakpoint } from 'lib/detect';

class HiddenInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value,
        };
    }

    componentDidUpdate() {
        if (
            isBreakpoint({
                max: 'mobile',
            })
        ) {
            fastdom.measure(() => {
                const offsets = bonzo(findDOMNode(this.input)).offset();
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
    }

    onClick(event) {
        this.props.crossword.onClickHiddenInput(event);
    }

    onKeyDown(event) {
        this.props.crossword.onKeyDown(event);
    }

    onBlur(event) {
        this.props.crossword.goToReturnPosition(event);
    }

    touchStart(event) {
        this.props.crossword.onClickHiddenInput(event);
    }

    handleChange(event) {
        this.props.crossword.insertCharacter(event.target.value);
        this.setState({
            value: '',
        });
    }

    render() {
        return (
            <div
                className="crossword__hidden-input-wrapper"
                ref={wrapper => {
                    this.wrapper = wrapper;
                }}>
                <input
                    type="text"
                    className="crossword__hidden-input"
                    // Avoids keyboard trap in this element. We haven't made this hidden
                    // because we don't understand the full implications of that.
                    // Fixes this https://github.com/guardian/dotcom-rendering/issues/5053
                    tabIndex="-1"
                    maxLength="1"
                    onClick={this.onClick.bind(this)}
                    onChange={this.handleChange.bind(this)}
                    onTouchStart={this.touchStart.bind(this)}
                    onKeyDown={this.onKeyDown.bind(this)}
                    onBlur={this.onBlur.bind(this)}
                    value={this.state.value}
                    autoComplete="off"
                    spellCheck="false"
                    autoCorrect="off"
                    ref={input => {
                        this.input = input;
                    }}
                />
            </div>
        );
    }
}

export { HiddenInput };
