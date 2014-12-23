/* jshint newcap: false */
define([
    'common/utils/_',
    'react',
    'common/modules/crosswords/constants',
    'common/modules/crosswords/flatMap'
], function (
    React,
    constants,
    flatMap
) {
    function position(a) {
        return (Math.floor(a / 3) + 2) * constants.borderSize +
            a * (constants.cellSize + constants.borderSize);
    }

    function highlights(focusX, focusY) {
        var focusSquareX = Math.floor(focusX / 3),
            focusSquareY = Math.floor(focusY / 3),
            column = _.map(_.range(9), function (y) {
            return {
                x: focusX,
                y: y
            };
        }), row = _.map(_.range(9), function (x) {
            return {
                x: x,
                y: focusY
            };
        }), square = flatMap(_.range(focusSquareX, focusSquareX + 3), function (x) {
            return _.map(_.range(focusSquareY, focusSquareY + 3), function (y) {
                return {
                    x: x,
                    y: y
                }
            })
        });

        return _.filter(_.uniq(column.concat(row, square), false, function (position) {
            /** A key function is needed, as Objects in JavaScript use reference equality */
            return position.x + "_" + position.y;
        }), function (position) {
            return !(position.x === focusX && position.y === focusY);
        });
    }

    return {
        position: position,
        highlights: highlights
    };
});
