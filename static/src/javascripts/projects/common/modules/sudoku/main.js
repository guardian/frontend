/* jshint newcap: false */
define([
    'common/utils/$',
    'react',
    'common/modules/crosswords/sudoku'
], function (
    $,
    React,
    Sudoku
) {
    return function () {
        $('.js-sudoku').each(function (element) {
            if (element.hasAttribute('data-sudoku-data')) {
                var sudokuData = JSON.parse(element.getAttribute('data-sudoku-data'));

                React.renderComponent(new Sudoku({
                    data: sudokuData
                }, element))
            } else {
                console.error('JavaScript Sudoku without associated "data-sudoku-data" attribute.', element);
            }
        });
    };
});
