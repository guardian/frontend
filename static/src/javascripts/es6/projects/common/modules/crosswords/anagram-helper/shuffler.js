import React from 'react';
import _ from 'common/utils/_';

export default class Shuffler extends React.Component {
    getLetters () {
        const entries = _.compact(_.map(this.props.entries, entry => entry.value.toLowerCase()));

        return _.shuffle(_.reduce(this.props.word.sort(), (acc, letter) => {
            const entered = acc.entries[0] === letter.toLowerCase();

            return {
                letters: acc.letters.concat({ value: letter, entered: entered }),
                entries: entered ? _.rest(acc.entries) : acc.entries
            };
        }, { letters: [], entries: entries.sort() }).letters);
    }

    getPosition (phase, i) {
        const radians = (phase * Math.PI / 180) * i;
        const scale = 35;

        return {
            left: 45 + (Math.sin(radians) * scale) + '%',
            top:  40 + (Math.cos(radians) * scale) + '%'
        };
    }

    render () {
        const letters = this.getLetters();
        const phase = 360 / letters.length;

        return (
            <div className='crossword__anagram-helper-shuffler'>
                {_.map(letters, (letter, i) => {
                    return (
                        <div
                            className={'crossword__anagram-helper-shuffler__letter ' + (letter.entered ? 'entered' : '')}
                            style={this.getPosition(phase, i)}
                            key={i}>
                            {letter.value}
                        </div>
                    );
                })}
            </div>
        );
    }
}
