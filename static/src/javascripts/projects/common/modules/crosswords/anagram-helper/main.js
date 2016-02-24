define([
    'react',
    'common/views/svgs',
    './clue-input',
    './clue-preview',
    './ring',
    '../helpers',
    'lodash/collections/contains',
    'lodash/collections/shuffle',
    'lodash/collections/reduce',
    'lodash/arrays/rest',
    'lodash/collections/map',
    'lodash/arrays/compact',
    'lodash/collections/filter',
    'common/utils/chain'
], function (
    React,
    svgs,
    ClueInput,
    CluePreview,
    Ring,
    helpers,
    contains,
    shuffle,
    reduce,
    rest,
    map,
    compact,
    filter,
    chain
) {
    var AnagramHelper = React.createClass({
        getInitialState: function () {
            return {
                clueInput: '',
                showInput: true
            };
        },

        componentWillReceiveProps: function (next) {
            // reset on clue change
            if (next.clue !== this.props.focussedEntry) {
                this.reset();
            }
        },

        reset: function () {
            if (this.state.clueInput) {
                this.setState({
                    clueInput: '',
                    showInput: true
                });
            }
        },

        shuffle: function () {
            if (this.canShuffle()) {
                this.setState({
                    showInput: false
                });
            }
        },

        canShuffle: function () {
            return this.state.clueInput &&
                this.state.clueInput.length > 0;
        },

        /**
         * Shuffle the letters in the user's input.
         *
         * First, create an array of input characters that have already been entered
         * into the grid. Then build a new collection of letters, using the first
         * array to flag letters that are already entered in the puzzle, and
         * shuffle it.
         *
         * @param  {String}   word     word to shuffle
         * @param  {[Object]} entries  array of entries (i.e. grid cells)
         * @return {[Object]}          array of shuffled letters
         */
        shuffleWord: function (word, entries) {
            var wordEntries = chain(entries).and(map, function (entry) {
                    return entry.value.toLowerCase();
                }).and(filter, function (entry) {
                    return contains(word, entry);
                }).and(compact).value().sort();

            return shuffle(reduce(word.trim().split('').sort(), function (acc, letter) {
                var entered = acc.entries[0] === letter.toLowerCase();

                return {
                    letters: acc.letters.concat({
                        value: letter,
                        entered: entered
                    }),
                    entries: entered ? rest(acc.entries) : acc.entries
                };
            }, {
                letters: [],
                entries: wordEntries
            }).letters);
        },

        onClueInput: function (text) {
            if (!/\s|\d/g.test(text)) {
                this.setState({
                    clueInput: text
                });
            }
        },

        render: function () {
            /* jscs:disable disallowDanglingUnderscores */
            var closeIcon = {
                __html: svgs('closeCentralIcon')
            };
            /* jscs:enable disallowDanglingUnderscores */
            var clue = helpers.getAnagramClueData(this.props.entries, this.props.focussedEntry);
            var cells = helpers.cellsForClue(this.props.entries, this.props.focussedEntry);
            var entries = map(cells, function (coords) {
                return this.props.grid[coords.x][coords.y];
            }, this);
            var letters = this.shuffleWord(this.state.clueInput, entries);

            var inner = this.state.showInput ?
                React.createElement(ClueInput, {
                    value: this.state.clueInput,
                    clue: clue,
                    onChange: this.onClueInput,
                    onEnter: this.shuffle
                }) :
                React.createElement(Ring, {
                    letters: letters
                });

            return React.createElement('div', {
                    className: 'crossword__anagram-helper-outer',
                    'data-link-name': 'Anagram Helper'
                },
                React.createElement('div', {
                    className: 'crossword__anagram-helper-inner'
                }, inner),
                React.createElement('button', {
                    className: 'button button--large button--tertiary crossword__anagram-helper-close',
                    onClick: this.props.close,
                    dangerouslySetInnerHTML: closeIcon,
                    'data-link-name': 'Close'
                }),
                React.createElement('button', {
                    className: 'button button--large ' + (!this.state.clueInput && 'button--tertiary'),
                    onClick: this.reset,
                    'data-link-name': 'Start Again'
                }, 'start again'),
                React.createElement('button', {
                    className: 'button button--large ' + (!this.canShuffle() && 'button--tertiary'),
                    onClick: this.shuffle,
                    'data-link-name': 'Shuffle'
                }, 'shuffle'),
                React.createElement(CluePreview, {
                    clue: clue,
                    entries: entries,
                    letters: letters,
                    hasShuffled: !this.state.showInput
                })
            );
        }
    });

    return AnagramHelper;
});
