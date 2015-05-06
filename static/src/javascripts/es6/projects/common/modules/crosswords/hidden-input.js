import React from 'react';

export default class extends React.Component {

    render () {
        return (
            <div className='crossword__hidden-input-wrapper' ref='wrapper'>
                <input type='text'
                    className='crossword__hidden-input'
                    maxLength='1'
                    onKeyDown={this.props.onKeyDown}
                    onClick={this.props.onClick}
                    value={this.props.value}
                    autoComplete='off'
                    spellCheck='false'
                    autoCorrect='off'
                    ref='input'
                />
            </div>
        );
    }
};

