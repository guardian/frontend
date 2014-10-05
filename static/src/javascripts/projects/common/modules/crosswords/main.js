define([
    'common/utils/$',
    'common/utils/_',
    'bean',
    'react',
    'common/modules/crosswords/clues',
    'common/modules/crosswords/grid'
], function (
    $,
    _,
    bean,
    React,
    Clues,
    Grid
) {
    function isAcross(clue) {
        return clue.direction === 'across';
    }

    function otherDirection(direction) {
        return direction === 'across' ? 'down' : 'across';
    }

    function buildGrid(rows, columns, entries) {
        var grid = _.map(_.range(columns), function () {
            return _.map(_.range(rows), function () {
                return {
                    isHighlighted: false,
                    isEditable: false
                };
            });
        });

        _.forEach(entries, function (entry) {
            var x = entry.position.x,
                y = entry.position.y;

            grid[x][y].number = entry.number;

            _.forEach(cellsApplicable(entry), function (cell) {
                grid[cell.x][cell.y].isEditable = true;
            });
        });

        return grid;
    }

    function cellsApplicable(entry) {
        var x = entry.position.x,
            y = entry.position.y,
            xDelta = 0,
            yDelta = 0,
            cells = [];

        if (isAcross(entry)) {
            xDelta = 1;
        } else {
            yDelta = 1;
        }

        _.forEach(_.range(entry.length), function (n) {
            var x1 = x, y1 = y;

            x1 += xDelta * n;
            y1 += yDelta * n;

            cells.push({
                x: x1,
                y: y1
            });
        });

        return cells;
    }

    function clueMapKey(x, y) {
        return x + '_' + y;
    }

    /** A map for looking up clues that a given cell relates to */
    function buildClueMap(clues) {
        var map = {};

        _.forEach(clues, function (clue) {
            _.forEach(cellsApplicable(clue), function (cell) {
                var key = clueMapKey(cell.x, cell.y);

                if (map[key] === undefined) {
                    map[key] = {};
                }

                if (isAcross(clue)) {
                    map[key].across = clue;
                } else {
                    map[key].down = clue;
                }
            });
        });

        return map;
    }

    var Crossword = React.createClass({
        getInitialState: function () {
            var dimensions = this.props.data.dimensions;

            this.columns = dimensions.cols;
            this.rows = dimensions.rows;
            this.clueMap = buildClueMap(this.props.data.entries);

            return {
                grid: buildGrid(dimensions.rows, dimensions.cols, this.props.data.entries),
                cellInFocus: null,
                directionOfEntry: null
            };
        },

        setCellValue: function (x, y, value) {
            this.state.grid[x][y].value = value;
            this.setState(this.state);
        },

        onSelect: function (x, y) {
            var cellInFocus = this.state.cellInFocus,
                clue = this.cluesFor(x, y),
                newDirection;

            if (cellInFocus && cellInFocus.x === x && cellInFocus.y === y) {
                newDirection = otherDirection(this.state.directionOfEntry);

                if (clue[newDirection]) {
                    this.state.directionOfEntry = newDirection;
                }
            } else {
                this.state.cellInFocus = {x: x, y: y};

                /** If an across clue exists, default to that on initial focus; otherwise, down */
                if (clue.across) {
                    this.state.directionOfEntry = 'across';
                } else {
                    this.state.directionOfEntry = 'down';
                }
            }

            this.setState(this.state);
        },

        cluesFor: function (x, y) {
            return this.clueMap[clueMapKey(x, y)];
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
                Grid({
                    rows: this.rows,
                    columns: this.columns,
                    cells: this.state.grid,
                    setCellValue: this.setCellValue,
                    onSelect: this.onSelect,
                    isHighlighted: isHighlighted
                }),
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
