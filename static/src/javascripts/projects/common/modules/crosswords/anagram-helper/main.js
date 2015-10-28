define([
    'react',
    'common/utils/_',
    'common/views/svgs',
    './clue-input',
    './clue-preview',
    './ring',
    '../helpers'
], function (
    React,
    _,
    svgs,
    ClueInput,
    CluePreview,
    Ring,
    helpers
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
            var wordEntries = _.chain(entries)
                .map(function (entry) {
                    return entry.value.toLowerCase();
                })
                .filter(function (entry) {
                    return _.contains(word, entry);
                })
                .compact()
                .value()
                .sort();

            return _.shuffle(_.reduce(word.trim().split('').sort(), function (acc, letter) {
                var entered = acc.entries[0] === letter.toLowerCase();

                return {
                    letters: acc.letters.concat({
                        value: letter,
                        entered: entered
                    }),
                    entries: entered ? _.rest(acc.entries) : acc.entries
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
            var entries = _.map(cells, function (coords) {
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
                    className: 'crossword__anagram-helper-outer'
                },
                React.createElement('div', {
                    className: 'crossword__anagram-helper-inner'
                }, inner),
                React.createElement('button', {
                    className: 'button button--large button--tertiary crossword__anagram-helper-close',
                    onClick: this.props.close,
                    dangerouslySetInnerHTML: closeIcon
                }),
                React.createElement('button', {
                    className: 'button button--large ' + (!this.state.clueInput && 'button--tertiary'),
                    onClick: this.reset
                }, 'start again'),
                React.createElement('button', {
                    className: 'button button--large ' + (!this.canShuffle() && 'button--tertiary'),
                    onClick: this.shuffle
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
