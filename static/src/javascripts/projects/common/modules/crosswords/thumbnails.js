define([
    'bonzo',
    'qwery',
    'common/utils/ajax',
    'fastdom',
    './helpers',
    './persistence',
    'lodash/arrays/flatten',
    'lodash/collections/map',
    'lodash/arrays/range',
    'lodash/collections/forEach'
], function (
    bonzo,
    qwery,
    ajax,
    fastdom,
    helpers,
    persistence,
    flatten,
    map,
    range,
    forEach
) {
    var textXOffset = 10;
    var textYOffset = 21;

    function makeTextCells(savedState) {
        var columns = savedState.length;
        var rows = savedState[0].length;

        return flatten(map(range(columns), function (column) {
            return map(range(rows), function (row) {
                var enteredText = savedState[column][row];

                if (enteredText) {
                    var el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    var top = helpers.gridSize(row);
                    var left = helpers.gridSize(column);

                    bonzo(el).attr({
                        x: left + textXOffset,
                        y: top + textYOffset,
                        'class': 'crossword__cell-text'
                    }).text(enteredText);

                    return [el];
                } else {
                    return [];
                }
            });
        }));
    }

    function init() {
        var thumbnails = qwery('.js-crossword-thumbnail');

        if (thumbnails.length) {
            forEach(thumbnails, function (elem) {
                var $elem = bonzo(elem);
                var savedState = persistence.loadGridState($elem.attr('data-crossword-id'));

                if (savedState) {
                    ajax({
                        url: $elem.attr('src'),
                        type: 'xml',
                        method: 'get',
                        crossOrigin: true,
                        success: function success(data) {
                            var cells = makeTextCells(savedState);
                            var svg = qwery('svg', data)[0];
                            bonzo(svg).append(cells);
                            fastdom.write(function () {
                                $elem.replaceWith(svg);
                            });
                        }
                    });
                }
            });
        }
    }

    return {
        init: init,
        makeTextCells: makeTextCells
    };
});
