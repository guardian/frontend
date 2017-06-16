// @flow
import React from 'react/addons';

const round = x => Math.round(x * 100) / 100;

const Ring = React.createClass({
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
    getPosition(angle, i) {
        const diameter = 40;
        const theta = angle * Math.PI / 180 * i;

        return {
            left: `${diameter + round(diameter * Math.sin(theta))}%`,
            top: `${diameter + round(diameter * Math.cos(theta))}%`,
        };
    },

    render() {
        const angle = 360 / this.props.letters.length;

        return React.createElement(
            'div',
            {
                className: 'crossword__anagram-helper-shuffler',
            },
            this.props.letters.map((letter, i) =>
                React.createElement(
                    'div',
                    {
                        className: `crossword__anagram-helper-shuffler__letter ${letter.entered
                            ? 'entered'
                            : ''}`,
                        style: this.getPosition(angle, i),
                        key: `l${i}`, // eslint-disable-line react/no-array-index-key
                    },
                    letter.value
                )
            )
        );
    },
});

export { Ring };
