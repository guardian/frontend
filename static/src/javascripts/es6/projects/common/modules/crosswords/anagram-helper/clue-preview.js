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

    /**
     * Get the entries for the preview cells: first filter the user's input to
     * remove anything anything that's already been entered into the grid.
     *
     * With that, we map over the entries, and wherever there's an empty space
    *  we insert one of the shuffled input characters.
     */
    getEntries () {
        const unsolved = this.props.letters.filter(l => !l.entered);

        return this.props.entries.map(entry => {
            entry.solved = !!entry.value;

            return this.props.hasShuffled
                ? entry.value && entry || unsolved.shift()
                : entry;
        });
    }


    render () {
        const entries = this.getEntries();

        return (
            <div className={'crossword__anagram-helper__clue-preview ' + (entries.length >= 9 ? 'long' : '')}>
                <div><strong>{this.props.clue.number} <span className="crossword__anagram-helper__direction">{this.props.clue.direction}</span></strong> {this.props.clue.clue}</div>

                {_.map(entries, (entry, i) => {
                    const classNames = this.checkIfLetterHasSeparator(this.props.clue.separatorLocations, i + 1);  //Separators are one indexed in CAPI, annoyingly
                    const span = <span className={classNames + (entry.solved ? ' has-value' : '')} key={i}>{entry.value}</span>;
                    return span;
                })}
            </div>
        );
    }
}
