/* jshint newcap: false */
define([
    'react',
    'common/modules/crosswords/constants',
    'common/modules/crosswords/utils'
], function (
    React,
    constants,
    utils
) {
    return React.createClass({
        focusCell: function (x, y) {
            // TODO fill me in
            console.log("Focussing " + x + ":" + y);
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
            var cells = [];

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
