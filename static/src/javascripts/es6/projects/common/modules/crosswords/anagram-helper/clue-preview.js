import React from 'react';
import _ from 'common/utils/_';

export default class CluePreview extends React.Component {
    render () {
        return (
            <div className={'crossword__anagram-helper__clue-preview ' + (this.props.entries.length >= 10 ? 'long' : '')}>
                <div><strong>{this.props.clue.number} <span className="crossword__anagram-helper__direction">{this.props.clue.direction}</span></strong> {this.props.clue.clue}</div>

                {_.map(this.props.entries, (entry, i) => {
                    return <span className={'crossword__anagram-helper__cell ' + (entry.value ? 'has-value' : '')} key={i}>{entry.value}</span>;
                })}
            </div>
        );
    }
}
