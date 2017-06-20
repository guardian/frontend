// @flow
import React from 'react/addons';
import { inlineSvg } from 'common/views/svgs';
import ClueInput from 'common/modules/crosswords/anagram-helper/clue-input';
import CluePreview from 'common/modules/crosswords/anagram-helper/clue-preview';
import { Ring } from 'common/modules/crosswords/anagram-helper/ring';
import helpers from 'common/modules/crosswords/helpers';
import shuffle from 'lodash/collections/shuffle';

const AnagramHelper = React.createClass({
    getInitialState() {
        return {
            clueInput: '',
            showInput: true,
        };
    },

    componentWillReceiveProps(next: any) {
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
     * @param  word     word to shuffle
     * @param  entries  array of entries (i.e. grid cells)
     *
     */
    shuffleWord(word: string, entries: Array<{ value: string }>) {
        const wordEntries = entries
            .map(entry => entry.value.toLowerCase())
            .filter(entry => word.includes(entry))
            .filter(Boolean)
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

    canShuffle() {
        return this.state.clueInput && this.state.clueInput.length > 0;
    },

    render() {
        const closeIcon = {
            __html: inlineSvg('closeCentralIcon'),
        };
        const clue = helpers.getAnagramClueData(
            this.props.entries,
            this.props.focussedEntry
        );
        const cells = helpers.cellsForClue(
            this.props.entries,
            this.props.focussedEntry
        );
        const entries = cells.map(
            coords => this.props.grid[coords.x][coords.y]
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
                    className: `button button--large ${!this.canShuffle()
                        ? 'button--tertiary'
                        : ''}`,
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
