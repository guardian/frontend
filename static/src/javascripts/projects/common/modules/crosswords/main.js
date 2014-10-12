define([
    'common/utils/$',
    'common/utils/_',
    'bean',
    'react',
    'common/modules/crosswords/clues',
    'common/modules/crosswords/grid',
    'common/modules/crosswords/helpers'
], function (
    $,
    _,
    bean,
    React,
    Clues,
    Grid,
    helpers
) {
    var BACKSPACE_KEYCODE = 8,
        Crossword = React.createClass({
        getInitialState: function () {
            var dimensions = this.props.data.dimensions;

            this.columns = dimensions.cols;
            this.rows = dimensions.rows;
            this.clueMap = helpers.buildClueMap(this.props.data.entries);

            return {
                grid: helpers.buildGrid(dimensions.rows, dimensions.cols, this.props.data.entries),
                cellInFocus: null,
                directionOfEntry: null
            };
        },

        setCellValue: function (x, y, value) {
            this.state.grid[x][y].value = value;
            this.setState(this.state);
        },

        onKeyDown: function (event) {
            var cell = this.state.cellInFocus;

            if (event.keyCode == BACKSPACE_KEYCODE) {
                this.setCellValue(cell.x, cell.y, null);
                this.focusPrevious();
            }
        },

        onKeyPress: function (event) {
            var value = event.key.toUpperCase(),
                cell = this.state.cellInFocus;

            if (/^[A-Z]$/.test(value)) {
                this.setCellValue(cell.x, cell.y, value);
                this.focusNext();
            }
        },

        _moveFocus: function (delta) {
            var cell = this.state.cellInFocus,
                direction = this.state.directionOfEntry,
                clue = this.clueInFocus(),
                isWithinClue = function (n, cluePos) { return n >= cluePos && n < cluePos + clue.length; },
                x,
                y;

            if (direction === 'across' && isWithinClue(cell.x + delta, clue.position.x)) {
                x = cell.x + delta;
                y = cell.y;
            } else if (direction === 'down' && isWithinClue(cell.y + delta, cell.position.y)) {
                x = cell.x;
                y = cell.y + delta;
            }

            if (x !== undefined) {
                this.focusHiddenInput(x, y);
                this.state.cellInFocus = {
                    x: x,
                    y: y
                };
                this.setState(this.state);
            }
        },

        focusPrevious: function () {
            this._moveFocus(-1);
        },

        focusNext: function () {
            this._moveFocus(1);
        },

        focusHiddenInput: function (x, y) {
            var wrapper = this.refs.hiddenInputWrapper.getDOMNode();

            wrapper.style.left = (x * 31) + "px";
            wrapper.style.top = (y * 31) + "px";
            this.refs.hiddenInput.getDOMNode().focus();
        },

        onSelect: function (x, y) {
            var cellInFocus = this.state.cellInFocus,
                clue = this.cluesFor(x, y),
                newDirection,
                isStartOfClue;

            this.focusHiddenInput(x, y);

            if (cellInFocus && cellInFocus.x === x && cellInFocus.y === y) {
                newDirection = helpers.otherDirection(this.state.directionOfEntry);

                if (clue[newDirection]) {
                    this.state.directionOfEntry = newDirection;
                }
            } else {
                this.state.cellInFocus = {x: x, y: y};

                isStartOfClue = function (clue) {
                    return clue && clue.position.x === x && clue.position.y === y;
                };

                /**
                 * If the user clicks on the start of a down clue midway through an across clue, we should
                 * prefer to highlight the down clue.
                 */
                if (!isStartOfClue(clue.across) && isStartOfClue(clue.down)) {
                    this.state.directionOfEntry = 'down';
                } else if (clue.across) {
                    /** Across is the default focus otherwise */
                    this.state.directionOfEntry = 'across';
                } else {
                    this.state.directionOfEntry = 'down';
                }
            }

            this.setState(this.state);
        },

        cluesFor: function (x, y) {
            return this.clueMap[helpers.clueMapKey(x, y)];
        },

        clueInFocus: function () {
            if (this.state.cellInFocus) {
                var cluesForCell = this.cluesFor(this.state.cellInFocus.x, this.state.cellInFocus.y);
                return cluesForCell[this.state.directionOfEntry];
            } else {
                return null;
            }
        },

        render: function () {
            var focussed = this.clueInFocus(),
                isHighlighted = function (x, y) {
                    if (focussed) {
                        var xMin = focussed.position.x,
                            yMin = focussed.position.y,
                            xMax = xMin + ((focussed.direction === 'across') ? focussed.length : 0),
                            yMax = yMin + ((focussed.direction === 'down') ? focussed.length : 0);
                        return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
                    } else {
                        return false;
                    }
                };

            return React.DOM.div(null,
                React.DOM.div({
                    className: 'crossword__grid-wrapper'
                },
                    Grid({
                        rows: this.rows,
                        columns: this.columns,
                        cells: this.state.grid,
                        setCellValue: this.setCellValue,
                        onSelect: this.onSelect,
                        isHighlighted: isHighlighted,
                        focussedCell: this.state.cellInFocus
                    }),
                    React.DOM.div({
                            className: 'crossword__hidden-input-wrapper',
                            ref: "hiddenInputWrapper"
                        },
                        React.DOM.input({
                                type: 'text',
                                className: 'crossword__hidden-input',
                                ref: "hiddenInput",
                                onKeyDown: this.onKeyDown,
                                onKeyPress: this.onKeyPress,
                                value: ""
                            }
                        ))
                ),
                Clues({
                    clues: this.props.data.entries
                })
            );
        }
    });

    return function () {
        $('.js-crossword').each(function (element) {
            if (element.hasAttribute('data-crossword-data')) {
                var crosswordData = JSON.parse(element.getAttribute('data-crossword-data'));
                React.renderComponent(new Crossword({data: crosswordData}), element);
            } else {
                throw 'JavaScript crossword without associated data in data-crossword-data';
            }
        });
    };
});
