import React from 'react';

export default class extends React.Component {

    constructor (props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.state = {
            value: this.props.value
        }
    }

    handleChange () {
        this.props.onChange(event.target.value.toUpperCase());
        this.setState({value: ''});
    }

    render () {
        return (
            <div className='crossword__hidden-input-wrapper' ref='wrapper'>
                <input type='text'
                    className='crossword__hidden-input'
                    maxLength='1'
                    onClick={this.props.onClick}
                    onChange={this.handleChange}
                    onKeyDown={this.props.onKeyDown}
                    value={this.state.value}
                    autoComplete='off'
                    spellCheck='false'
                    autoCorrect='off'
                    ref='input'
                />
            </div>
        );
    }
};

