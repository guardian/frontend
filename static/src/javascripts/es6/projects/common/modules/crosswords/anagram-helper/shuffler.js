import React from 'react';
import _ from 'common/utils/_';

const round = x => Math.round(x * 100) / 100;

export default class Shuffler extends React.Component {
    getLetters () {
        const entries = _.chain(this.props.entries)
            .map(entry => entry.value.toLowerCase())
            .filter(entry => _.contains(this.props.word.map(l => l.toLowerCase()), entry))
            .compact()
            .value();

        return _.shuffle(_.reduce(this.props.word.sort(), (acc, letter) => {
            const entered = acc.entries[0] === letter.toLowerCase();

            return {
                letters: acc.letters.concat({ value: letter, entered: entered }),
                entries: entered ? _.rest(acc.entries) : acc.entries
            };
        }, { letters: [], entries: entries.sort() }).letters);
    }

    /**
     * Get coordinates for a letter as percentages.
     *
     * To get the diameter:
     *   (width of .crossword__anagram-helper-shuffler) - (2 * desired padding)
     *
     * @param  {Number} angle   angle of letters on the circle
     * @param  {Number} i       letter index
     * @return {Object}         with 'left' and 'top' properties in percent
     */
    getPosition (angle, i) {
        const diameter = 40;
        const theta = (angle * Math.PI / 180) * i;

        return {
            left: diameter + round(diameter * Math.sin(theta)) + '%',
            top:  diameter + round(diameter * Math.cos(theta)) + '%'
        };
    }

    render () {
        const letters = this.getLetters();
        const angle = 360 / letters.length;

        return (
            <div className='crossword__anagram-helper-shuffler'>
                {_.map(letters, (letter, i) => {
                    return (
                        <div
                            className={'crossword__anagram-helper-shuffler__letter ' + (letter.entered ? 'entered' : '')}
                            style={this.getPosition(angle, i)}
                            key={i}>
                            {letter.value}
                        </div>
                    );
                })}
            </div>
        );
    }
}
