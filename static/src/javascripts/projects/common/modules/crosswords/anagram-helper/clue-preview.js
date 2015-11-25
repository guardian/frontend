define([
    'react',
    'lodash/collections/some',
    'lodash/collections/map'
], function (
    React,
    some,
    map) {
    var CluePreview = React.createClass({

        letterHasBoundary: function (separators, letterIndex) {
            return some(separators, function (separator) {
                return separator === letterIndex;
            });
        },

        //Checks a object in the form{",":[4,7]}
        checkIfLetterHasSeparator: function (locations, letterIndex) {
            var spaces = locations[','];
            if (spaces && this.letterHasBoundary(spaces, letterIndex)) {
                return 'crossword__anagram-helper__cell crossword__anagram-helper__cell--with-space';
            }

            var dashes = locations['-'];
            if (dashes && this.letterHasBoundary(dashes, letterIndex)) {
                return 'crossword__anagram-helper__cell crossword__anagram-helper__cell--with-hyphen';
            }

            return 'crossword__anagram-helper__cell';
        },

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
        getEntries: function () {
            var unsolved = this.props.letters.filter(function (l) {
                return !l.entered;
            });

            return this.props.entries.map(function (entry) {
                entry.solved = !!entry.value;

                return this.props.hasShuffled ? entry.value && entry || unsolved.shift() : entry;
            }.bind(this));
        },

        render: function () {
            var entries = this.getEntries();

            return React.createElement(
                'div', {
                    className: 'crossword__anagram-helper__clue-preview ' + (entries.length >= 9 ? 'long' : '')
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
                            'span', {
                                className: 'crossword__anagram-helper__direction'
                            },
                            this.props.clue.direction
                        )
                    ),
                    ' ',
                    this.props.clue.clue
                ),
                map(entries, (function (entry, i) {
                    var classNames = this.checkIfLetterHasSeparator(this.props.clue.separatorLocations, i + 1); //Separators are one indexed in CAPI, annoyingly
                    var span = React.createElement(
                        'span', {
                            className: classNames + (entry.solved ? ' has-value' : ''),
                            key: i
                        },
                        entry.value
                    );
                    return span;
                }), this)
            );
        }
    });

    return CluePreview;
});
