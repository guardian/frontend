import React from 'react';

export default class CluePreview extends React.Component {
    render () {
        return (
            <div className='crossword__anagram-helper__clue-preview'>
                <div><strong>{this.props.clue.number} <span class="crossword__anagram-helper__direction">{this.props.clue.direction}</span></strong> {this.props.clue.clue}</div>

                {this.props.entries.map(entry => {
                    return <span className={'crossword__anagram-helper__cell ' + (entry.value ? 'has-value' : '')}>{entry.value}</span>;
                })}
            </div>
        );
    }
}
