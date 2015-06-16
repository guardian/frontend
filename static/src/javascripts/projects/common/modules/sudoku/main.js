/* eslint-disable new-cap */
define([
    'bonzo',
    'react',
    'common/utils/$',
    'common/utils/_',
    'common/modules/sudoku/flatMap',
    'common/modules/sudoku/grid'
], function (
    bonzo,
    React,
    $,
    _,
    flatMap,
    Grid
) {
    return function () {
        $('.js-sudoku').each(function (element) {
            var $element = bonzo(element),
                sudokuData,
                cells;

            if ($element.attr('data-sudoku-data')) {
                sudokuData = JSON.parse($element.attr('data-sudoku-data'));
                cells = flatMap(_.range(9), function (y) {
                    return _.map(_.range(9), function (x) {
                        return {
                            x: x,
                            y: y,
                            value: sudokuData[x][y],
                            jottings: [],
                            isEditable: sudokuData[x][y] === null,
                            isFocussed: false,
                            isHighlighted: false,
                            isSameValue: false,
                            isError: false
                        };
                    });
                });

                React.render(Grid({
                    cells: cells
                }), element);
            }
        });
    };
});
