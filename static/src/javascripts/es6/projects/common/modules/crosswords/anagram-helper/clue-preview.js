import React from 'react';
import _ from 'common/utils/_';

export default class CluePreview extends React.Component {

    letterHasBoundary(separators, letterIndex) {
        return _.some(separators, function (separator) {
            return separator === letterIndex;
        });
    }

    //Checks a object in the form{",":[4,7]}
    checkIfLetterHasSeparator (locations, letterIndex) {
        const spaces = locations[','];
        if (spaces && this.letterHasBoundary(spaces, letterIndex)) {
            return 'crossword__anagram-helper__cell crossword__anagram-helper__cell--with-space';
        }

        const dashes = locations['-'];
        if (dashes && this.letterHasBoundary(dashes, letterIndex)) {
            return 'crossword__anagram-helper__cell crossword__anagram-helper__cell--with-hyphen';
        }

        return 'crossword__anagram-helper__cell';
    }


    render () {
        return (
            <div className={'crossword__anagram-helper__clue-preview ' + (this.props.entries.length >= 9 ? 'long' : '')}>
                <div><strong>{this.props.clue.number} <span className="crossword__anagram-helper__direction">{this.props.clue.direction}</span></strong> {this.props.clue.clue}</div>

                {_.map(this.props.entries, (entry, i) => {
                    const classNames = this.checkIfLetterHasSeparator(this.props.clue.separatorLocations, i + 1);  //Separators are one indexed in CAPI, annoyingly
                    const span = <span className={classNames + (entry.value ? ' has-value' : '')} key={i}>{entry.value}</span>;
                    return span;
                })}
            </div>
        );
    }
}
