// @flow
import React, { Component, findDOMNode } from 'react';

class ClueInput extends Component {
    componentDidMount() {
        findDOMNode(this).focus();
    }

    componentDidUpdate() {
        // focus on reset
        if (this.props.value === '') {
            findDOMNode(this).focus();
        }
    }

    onInputChange(e: Event) {
        if (!(e.target instanceof HTMLInputElement)) {
            return;
        }
        this.props.onChange(e.target.value.toLowerCase());
    }

    onKeyDown(e: Event) {
        if (e.keyCode === 13) {
            findDOMNode(this).blur();
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
