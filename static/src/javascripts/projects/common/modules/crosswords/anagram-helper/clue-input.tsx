
import React, { Component, findDOMNode } from "preact-compat";

class ClueInput extends Component<any, any> {

  componentDidMount() {
    const el: HTMLElement = (findDOMNode(this) as any);

    if (el) {
      el.focus();
    }
  }

  componentDidUpdate() {
    const el: HTMLElement = (findDOMNode(this) as any);

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

  onKeyDown(e: KeyboardEvent) {
    const el: HTMLElement = (findDOMNode(this) as any);

    if (e.keyCode === 13 && el) {
      el.blur();
      this.props.onEnter();
    }
  }

  render() {
    return <input type="text" className="crossword__anagram-helper__clue-input" placeholder="Enter letters" maxLength={this.props.clue.length} value={this.props.value} onChange={this.onInputChange.bind(this)} onKeyDown={this.onKeyDown.bind(this)} />;
  }
}

export { ClueInput };