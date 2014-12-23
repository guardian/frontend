/* jshint newcap: false */
define([
    'common/utils/_',
    'react',
    'common/modules/sudoku/cell',
    'common/modules/sudoku/constants',
    'common/modules/sudoku/flatMap',
    'common/modules/sudoku/utils'
], function (
    _,
    React,
    Cell,
    constants,
    flatMap,
    utils
) {
    return React.createClass({
        getInitialState: function () {
            return {
                cells: this.props.cells
            };
        },

        focusCell: function (x, y) {
            var isHighlighted = utils.highlights(x, y),
                valueInFocus = this.getCell(x, y).value;

            this.state.focus = {
                x: x,
                y: y
            };

            this.mapCells(function (cell) {
                return _.extend({}, cell, {
                    isHighlighted: isHighlighted(cell.x, cell.y),
                    isSameValue: cell.value && cell.value === valueInFocus,
                    isFocussed: cell.x === x && cell.y === y
                });
            });
        },

        getCell: function(x, y) {
            return this.state.cells[y * 9 + x];
        },

        mapCells: function (f) {
            this.state.cells = _.map(this.state.cells, f);
            this.forceUpdate();
        },

        onKeyDown: function (event) {
            var x, y;

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
                }
            }
        },

        render: function () {
            var self = this,
                cells = _.map(this.state.cells, function (cell) {
                var data = _.extend({}, cell, {
                    key: cell.x + '_' + cell.y,
                    onClick: self.focusCell
                });

                return Cell(data);
            }), gridSize = utils.position(9);

            return React.DOM.svg({
                width: gridSize,
                height: gridSize,
                tabIndex: '0',
                onKeyDown: this.onKeyDown,
                className: 'sudoku__grid'
            }, React.DOM.rect({
                className: 'sudoku__background',
                x: 0,
                y: 0,
                width: gridSize,
                height: gridSize
            }), cells);
        }
    });
});
