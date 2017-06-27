// @flow
import React from 'react/addons';
import { markup as closeCentralIcon } from 'svgs/icon/close-central.svg';
import helpers from 'common/modules/crosswords/helpers';
import shuffle from 'lodash/collections/shuffle';
import { ClueInput } from './clue-input';
import { CluePreview } from './clue-preview';
import { Ring } from './ring';

const AnagramHelper = React.createClass({
    getInitialState() {
        return {
            clueInput: '',
            showInput: true,
        };
    },

    componentWillReceiveProps(next: Object) {
        // reset on clue change
        if (next.clue !== this.props.focussedEntry) {
            this.reset();
        }
    },

    onClueInput(text: string) {
        if (!/\s|\d/g.test(text)) {
            this.setState({
                clueInput: text,
            });
        }
    },

    /**
     * Shuffle the letters in the user's input.
     *
     * First, create an array of input characters that have already been entered
     * into the grid. Then build a new collection of letters, using the first
     * array to flag letters that are already entered in the puzzle, and
     * shuffle it.
     *
     */
    shuffleWord(word: string, entries: { value: string }[]) {
        const wordEntries = entries
            .map(entry => entry.value.toLowerCase())
            .filter(entry => word.includes(entry))
            .sort();

        return shuffle(
            word.trim().split('').sort().reduce((acc, letter) => {
                const [head, ...tail] = acc.entries;
                const entered = head === letter.toLowerCase();

                return {
                    letters: acc.letters.concat({
                        value: letter,
                        entered,
                    }),
                    entries: entered ? tail : acc.entries,
                };
            }, {
                letters: [],
                entries: wordEntries,
            }).letters
        );
    },

    shuffle() {
        if (this.canShuffle()) {
            this.setState({
                showInput: false,
            });
        }
    },

    reset() {
        if (this.state.clueInput) {
            this.setState({
                clueInput: '',
                showInput: true,
            });
        }
    },

    canShuffle(): boolean {
        return !!this.state.clueInput && this.state.clueInput.length > 0;
    },

    render() {
        const closeIcon = {
            __html: closeCentralIcon,
        };
        const clue = helpers.getAnagramClueData(
            this.props.entries,
            this.props.focussedEntry
        );
        const cells = helpers.cellsForClue(
            this.props.entries,
            this.props.focussedEntry
        );
        const entries = cells.map(coords =>
            Object.assign({}, this.props.grid[coords.x][coords.y], {
                key: `${coords.x},${coords.y}`,
            })
        );

        const letters = this.shuffleWord(this.state.clueInput, entries);

        const inner = this.state.showInput
            ? React.createElement(ClueInput, {
                  value: this.state.clueInput,
                  clue,
                  onChange: this.onClueInput,
                  onEnter: this.shuffle,
              })
            : React.createElement(Ring, {
                  letters,
              });

        return React.createElement(
            'div',
            {
                className: 'crossword__anagram-helper-outer',
                'data-link-name': 'Anagram Helper',
            },
            React.createElement(
                'div',
                {
                    className: 'crossword__anagram-helper-inner',
                },
                inner
            ),
            React.createElement('button', {
                className:
                    'button button--large button--tertiary crossword__anagram-helper-close',
                onClick: this.props.close,
                dangerouslySetInnerHTML: closeIcon,
                'data-link-name': 'Close',
            }),
            React.createElement(
                'button',
                {
                    className: `button button--large ${!this.state.clueInput
                        ? 'button--tertiary'
                        : ''}`,
                    onClick: this.reset,
                    'data-link-name': 'Start Again',
                },
                'start again'
            ),
            React.createElement(
                'button',
                {
                    className: `button button--large ${this.canShuffle()
                        ? ''
                        : 'button--tertiary'}`,
                    onClick: this.shuffle,
                    'data-link-name': 'Shuffle',
                },
                'shuffle'
            ),
            React.createElement(CluePreview, {
                clue,
                entries,
                letters,
                hasShuffled: !this.state.showInput,
            })
        );
    },
});

export { AnagramHelper };
