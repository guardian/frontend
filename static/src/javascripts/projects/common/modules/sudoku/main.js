/* jshint newcap: false */
define([
    'common/utils/$',
    'common/utils/_',
    'react',
    'common/modules/crosswords/flatMap',
    'common/modules/crosswords/grid'
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
                var sudokuData = JSON.parse(element.getAttribute('data-sudoku-data'));

                var cells = flatMap(_.range(9), function (y) {
                    return _.map(_.range(9), function (x) {
                        return {
                            x: x,
                            y: y,
                            value: sudokuData[x][y],
                            isEditable: sudokuData[x][y] === null,
                            isFocussed: false,
                            isHighlighted: false,
                            isSameValue: false
                        };
                    });
                });

                React.renderComponent(new Grid({
                    cells: cells
                }, element))
            } else {
                console.error('JavaScript Sudoku without associated "data-sudoku-data" attribute.', element);
            }
        });
    };
});
