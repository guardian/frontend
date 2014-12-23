/* jshint newcap: false */
define([
    'react',
    'common/modules/crosswords/constants'
], function (
    React,
    constants
) {
    function position(a) {
        return (Math.floor(a / 3) + 2) * constants.borderSize +
            a * (constants.cellSize + constants.borderSize);
    }

    function highlights(focusX, focusY) {
        var focusSquareX = Math.floor(focusX / 3),
            focusSquareY = Math.floor(focusY / 3);

        return function (x, y) {
            var squareX = Math.floor(x / 3),
                squareY = Math.floor(y / 3);

            return x == focusX ||
                y == focusY ||
                squareX == focusSquareX && squareY == focusSquareY;
        };
    }

    return {
        position: position,
        highlights: highlights
    };
});
