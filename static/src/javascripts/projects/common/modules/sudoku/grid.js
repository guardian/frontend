/* jshint newcap: false */
define([
    'react',
    'common/modules/crosswords/cell',
    'common/modules/crosswords/constants',
    'common/modules/crosswords/flatMap',
    'common/modules/crosswords/utils'
], function (
    React,
    Cell,
    constants,
    flatMap,
    utils
) {
    return React.createClass({
        focusCell: function (x, y) {
            this.state.focus = {
                x: x,
                y: y
            };

            this.mapCells(function (cell) {
                return _.extend({}, cell, {

                });
            });
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
                    this.focusCell({
                        x: x - 1,
                        y: y
                    });
                } else if (event.keyCode === constants.keyRight && x < 8) {
                    this.focusCell({
                        x: x + 1,
                        y: y
                    });
                } else if (event.keyCode === constants.keyUp && y > 0) {
                    this.focusCell({
                        x: x,
                        y: y - 1
                    });
                } else if (event.keyCode === constants.keyDown && y < 8) {
                    this.focusCell({
                        x: x,
                        y: y + 1
                    });
                }
            }

            event.preventDefault();
        },

        render: function () {
            var cells = _.map(this.state.cells, function (cell) {
                var data = _.clone(cell);
                data.key = cell.x + '_' + cell.y;
                return new Cell(data);
            });

            return React.DOM.svg({
                width: utils.position(9),
                height: utils.position(9),
                tabIndex: "0",
                onKeyDown: this.onKeyDown,
                className: "sudoku__grid"
            }, cells);
        }
    });
});
