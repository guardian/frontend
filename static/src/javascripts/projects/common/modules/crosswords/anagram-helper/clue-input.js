// @flow
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

class ClueInput extends Component<*, *> {
    componentDidMount() {
        const el: HTMLElement = (findDOMNode(this): any);

        if (el) {
            el.focus();
        }
    }

    componentDidUpdate() {
        const el: HTMLElement = (findDOMNode(this): any);

        // focus on reset
        if (this.props.value === '' && el) {
            el.focus();
        }
    }

    onInputChange(e: Event) {
        if (!(e.target instanceof HTMLInputElement)) {
            return;
        }
        this.props.onChange(e.target.value.toLowerCase());
    }

    onKeyDown(e: Event) {
        const el: HTMLElement = (findDOMNode(this): any);

        if (e.keyCode === 13 && el) {
            el.blur();
            this.props.onEnter();
        }
    }

    render() {
        return (
            <input
                type="text"
                className="crossword__anagram-helper__clue-input"
                placeholder="Enter letters"
                maxLength={this.props.clue.length}
                value={this.props.value}
                onChange={this.onInputChange.bind(this)}
                onKeyDown={this.onKeyDown.bind(this)}
            />
        );
    }
}

export { ClueInput };
