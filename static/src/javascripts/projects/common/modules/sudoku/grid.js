/*eslint-disable new-cap*/
define([
    'react',
    'common/modules/sudoku/cell',
    'common/modules/sudoku/controls',
    'common/modules/sudoku/constants',
    'common/modules/sudoku/flatMap',
    'common/modules/sudoku/utils',
    'lodash/collections/map',
    'lodash/arrays/range',
    'lodash/collections/forEach',
    'lodash/objects/assign',
    'lodash/functions/bind',
    'lodash/utilities/constant',
    'lodash/collections/contains',
    'lodash/arrays/without'
], function (
    React,
    Cell,
    Controls,
    constants,
    flatMap,
    utils,
    map,
    range,
    forEach,
    assign,
    bind,
    constant,
    contains,
    without) {
    return React.createClass({
        getInitialState: function () {
            return {
                cells: this.props.cells
            };
        },

        focusCell: function (x, y) {
            this.state.focus = {
                x: x,
                y: y
            };

            this.updateCellStatesAndRender();
        },

        highlightDuplicatesInRange: function (cells) {
            var cellsByValue = map(range(9), function () {
                return [];
            });

            forEach(cells, function (cell) {
                if (cell.value) {
                    cellsByValue[cell.value - 1].push(cell);
                }
            });

            forEach(cellsByValue, function (cells) {
                if (cells.length > 1) {
                    forEach(cells, function (cell) {
                        cell.isError = true;
                    });
                }
            });
        },

        highlightErrors: function () {
            var self = this, rows, columns, squares;

            this.mapCells(function (cell) {
                return assign({}, cell, {
                    isError: false
                });
            });

            rows = map(range(9), function (y) {
                return map(range(9), function (x) {
                    return self.getCell(x, y);
                });
            });

            columns = map(range(9), function (x) {
                return map(range(9), function (y) {
                    return self.getCell(x, y);
                });
            });

            squares = flatMap(range(3), function (x) {
                return map(range(3), function (y) {
                    return flatMap(range(3), function (dx) {
                        return map(range(3), function (dy) {
                            return self.getCell(x * 3 + dx, y * 3 + dy);
                        });
                    });
                });
            });

            forEach(rows.concat(columns, squares), bind(this.highlightDuplicatesInRange, this));
        },

        updateCellStatesAndRender: function () {
            var focus = this.state.focus,
                isHighlighted = focus ? utils.highlights(focus.x, focus.y) : constant(false),
                focussedCell = this.getFocussedCell(),
                valueInFocus = focussedCell ? focussedCell.value : null;

            this.mapCells(function (cell) {
                return assign({}, cell, {
                    isHighlighted: isHighlighted(cell.x, cell.y),
                    isSameValue: cell.value && cell.value === valueInFocus,
                    isFocussed: focus && cell.x === focus.x && cell.y === focus.y
                });
            });

            this.highlightErrors();
            this.forceUpdate();
        },

        addJotting: function (n) {
            var focussed = this.getFocussedCell();

            if (focussed.isEditable) {
                focussed.value = null;

                if (contains(focussed.jottings, n)) {
                    focussed.jottings = without(focussed.jottings, n);
                } else {
                    focussed.jottings.push(n);
                }

                this.updateCellStatesAndRender();
            }
        },

        setFocussedValue: function (n) {
            var focussed = this.getFocussedCell();

            if (focussed && focussed.isEditable) {
                focussed.value = n;
                focussed.jottings = [];

                this.updateCellStatesAndRender();
            }
        },

        unsetFocussedValue: function () {
            var focussed = this.getFocussedCell();

            if (focussed.isEditable && focussed.value !== null) {
                focussed.value = null;
                this.updateCellStatesAndRender();
            }
        },

        getCell: function (x, y) {
            return this.state.cells[y * 9 + x];
        },

        getFocussedCell: function () {
            var focus = this.state.focus;

            if (focus) {
                return this.getCell(focus.x, focus.y);
            } else {
                return null;
            }
        },

        mapCells: function (f) {
            this.state.cells = map(this.state.cells, f);
            this.forceUpdate();
        },

        onBlur: function () {
            this.state.focus = null;
            this.updateCellStatesAndRender();
        },

        onKeyDown: function (event) {
            var x, y, n;

            if (this.state.focus) {
                x = this.state.focus.x;
                y = this.state.focus.y;

                if (event.keyCode === constants.keyLeft && x > 0) {
                    event.preventDefault();
                    this.focusCell(x - 1, y);
                } else if (event.keyCode === constants.keyRight && x < 8) {
                    event.preventDefault();
                    this.focusCell(x + 1, y);
                } else if (event.keyCode === constants.keyUp && y > 0) {
                    event.preventDefault();
                    this.focusCell(x, y - 1);
                } else if (event.keyCode === constants.keyDown && y < 8) {
                    event.preventDefault();
                    this.focusCell(x, y + 1);
                } else if (event.keyCode === constants.keyBackspace) {
                    event.preventDefault();
                    this.unsetFocussedValue();
                } else {
                    n = utils.numberFromKeyCode(event.keyCode);

                    if (n !== null && n > 0) {
                        event.preventDefault();

                        if (event.ctrlKey) {
                            this.addJotting(n);
                        } else {
                            this.setFocussedValue(n);
                        }
                    }
                }
            }
        },

        render: function () {
            var self = this,
                cells = map(this.state.cells, function (cell) {
                    var data = assign({}, cell, {
                        key: cell.x + '_' + cell.y,
                        onClick: self.focusCell
                    });

                    return Cell(data);
                }),
                gridSize = utils.position(9);

            return React.DOM.svg({
                width: gridSize,
                height: gridSize + constants.controlsTopMargin + constants.controlsHeight,
                tabIndex: '0',
                onKeyDown: this.onKeyDown,
                className: 'sudoku__grid',
                viewBox: '0 0 ' + gridSize + ' ' + (gridSize + constants.controlsTopMargin + constants.controlsHeight),
                onBlur: this.onBlur
            }, React.DOM.rect({
                className: 'sudoku__background',
                x: 0,
                y: 0,
                width: gridSize,
                height: gridSize
            }), Controls({
                x: constants.controlsLeftMargin,
                y: gridSize + constants.controlsTopMargin,
                onClickNumber: this.setFocussedValue,
                onClickDelete: this.unsetFocussedValue
            }), cells);
        }
    });
});
