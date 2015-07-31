import React from 'react';

export default class ClueInput extends React.Component {
    componentDidMount () {
        React.findDOMNode(this).focus();
    }

    componentWillReceiveProps (props) {
        // focus on reset
        if (props.value === '') {
            const node = React.findDOMNode(this);
            setTimeout(node.focus.bind(node), 4);
        }
    }

    onInputChange (e) {
        this.props.onChange(e.target.value.toLowerCase());
    }

    onKeyDown (e) {
        if (e.keyCode === 13) {
            React.findDOMNode(this).blur();
            this.props.onEnter();
        }
    }

    render() {
        return (
            <input type='text'
                className='crossword__anagram-helper__clue-input'
                placeholder='Enter letters'
                maxLength={this.props.clue.length}
                value={this.props.value}
                onChange={this.onInputChange.bind(this)}
                onKeyDown={this.onKeyDown.bind(this)} />
        );
    }
}
