define([
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax',
    'bonzo',
    'qwery',
    'common/modules/crosswords/persistence'
], function (
    _,
    $,
    ajax,
    bonzo,
    qwery,
    persistence
) {
    return function () {
        _.forEach(qwery('.js-crossword-thumbnail'), function (elem) {
            var $elem = bonzo(elem),
                savedState = persistence.loadGridState($elem.attr('data-crossword-id')),
                rows,
                columns;

            if (savedState) {
                columns = savedState.length;
                rows = savedState[0].length;

                ajax({
                    url: $elem.attr('src'),
                    type: 'xml',
                    method: 'get',
                    crossOrigin: true,
                    success: function (data) {
                        var cells = _.flatten(_.map(_.range(columns), function (column) {
                            return _.map(_.range(rows), function (row) {
                                var enteredText = savedState[column][row],
                                    el,
                                    top,
                                    left;

                                if (enteredText) {
                                    el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                                    top = row * 31 + 1;
                                    left = column * 31 + 1;

                                    bonzo(el).attr({
                                        x: left + 15,
                                        y: top + 19,
                                        className: 'crossword__cell-text'
                                    }).text(enteredText);

                                    return [el];
                                } else {
                                    return [];
                                }
                            });
                        })), svg = qwery('svg', data)[0];

                        bonzo(svg).append(cells);

                        $elem.replaceWith(svg);
                    }
                });
            }
        });
    };
});
