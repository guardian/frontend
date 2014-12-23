/* jshint newcap: false */
define([
    'common/utils/$',
    'common/utils/_',
    'react',
    'common/modules/sudoku/flatMap',
    'common/modules/sudoku/grid'
], function (
    $,
    _,
    React,
    flatMap,
    Grid
) {
    return function () {
        $('.js-sudoku').each(function (element) {
            if (element.hasAttribute('data-sudoku-data')) {
                var sudokuData = JSON.parse(element.getAttribute('data-sudoku-data')),
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
                            isSameValue: false
                        };
                    });
                });

                React.renderComponent(Grid({
                    cells: cells
                }), element);
            } else {
                console.error('JavaScript Sudoku without associated "data-sudoku-data" attribute.', element);
            }
        });
    };
});
