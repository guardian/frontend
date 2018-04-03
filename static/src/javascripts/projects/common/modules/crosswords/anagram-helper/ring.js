// @flow
import React, { Component } from 'react';

const round = x => Math.round(x * 100) / 100;
/**
 * Get coordinates for a letter as percentages.
 *
 * To get the diameter:
 *   (width of .crossword__anagram-helper-shuffler) - (2 * desired padding)
 */
const getPosition = (
    angle: number,
    i: number
): { left: string, top: string } => {
    const diameter = 40;
    const theta = angle * Math.PI / 180 * i;

    return {
        left: `${diameter + round(diameter * Math.sin(theta))}%`,
        top: `${diameter + round(diameter * Math.cos(theta))}%`,
    };
};

class Ring extends Component<*, *> {
    render() {
        const angle = 360 / this.props.letters.length;

        return (
            <div className="crossword__anagram-helper-shuffler">
                {this.props.letters.map((letter, i) => (
                    <div
                        className={`crossword__anagram-helper-shuffler__letter ${
                            letter.entered ? 'entered' : ''
                        }`}
                        style={getPosition(angle, i)}
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${letter.value}-${i}`}>
                        {letter.value}
                    </div>
                ))}
            </div>
        );
    }
}

export { Ring };
