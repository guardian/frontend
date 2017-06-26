// @flow
import React from 'react/addons';

const CluePreview = React.createClass({
    /**
     * Get the entries for the preview cells: first filter the user's input to
     * remove anything anything that's already been entered into the grid.
     *
     * With that, we map over the entries, and wherever there's an empty space
     * we insert one of the shuffled input characters.
     *
     * If the user hasn't yet clicked 'shuffle' (this.props.hasShuffled) just
     * display the entries as they are, preserving any blank spaces.
     */
    getEntries(): Array<Object> {
        const unsolved = this.props.letters.filter(l => !l.entered);

        return this.props.entries.map(entry => {
            entry.solved = !!entry.value;

            const returnVal = this.props.hasShuffled
                ? (entry.value && entry) || unsolved.shift()
                : entry;

            return Object.assign({}, { key: entry.key }, returnVal);
        });
    },

    // Checks a object in the form{",":[4,7]}
    checkIfLetterHasSeparator(
        locations: { ','?: Array<number>, '-'?: Array<number> },
        letterIndex: number
    ): string {
        const spaces = locations[','];
        if (spaces && this.letterHasBoundary(spaces, letterIndex)) {
            return 'crossword__anagram-helper__cell crossword__anagram-helper__cell--with-space';
        }

        const dashes = locations['-'];
        if (dashes && this.letterHasBoundary(dashes, letterIndex)) {
            return 'crossword__anagram-helper__cell crossword__anagram-helper__cell--with-hyphen';
        }

        return 'crossword__anagram-helper__cell';
    },

    letterHasBoundary(separators: Array<number>, letterIndex: number): boolean {
        return separators.some(separator => separator === letterIndex);
    },

    render() {
        const entries = this.getEntries();

        return React.createElement(
            'div',
            {
                className: `crossword__anagram-helper__clue-preview ${entries.length >=
                    9
                    ? 'long'
                    : ''}`,
            },
            React.createElement(
                'div',
                null,
                React.createElement(
                    'strong',
                    null,
                    this.props.clue.number,
                    ' ',
                    React.createElement(
                        'span',
                        {
                            className: 'crossword__anagram-helper__direction',
                        },
                        this.props.clue.direction
                    )
                ),
                ' ',
                this.props.clue.clue
            ),
            entries.map((entry, i) => {
                const classNames = this.checkIfLetterHasSeparator(
                    this.props.clue.separatorLocations,
                    i + 1
                ); // Separators are one indexed in CAPI, annoyingly
                const span = React.createElement(
                    'span',
                    {
                        className:
                            classNames + (entry.solved ? ' has-value' : ''),
                        key: entry.key,
                    },
                    entry.value || ''
                );

                return span;
            })
        );
    },
});

export { CluePreview };
