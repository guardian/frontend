import _ from 'common/utils/_';
import $ from 'common/utils/$';
import bonzo from 'bonzo';
import qwery from 'qwery';
import ajax from 'common/utils/ajax';

import helpers from 'es6/projects/common/modules/crosswords/helpers';
import persistence from 'es6/projects/common/modules/crosswords/persistence';

var textXOffset = 15,
    textYOffset = 19;

function makeTextCells(savedState) {
    var columns = savedState.length,
        rows = savedState[0].length;

    return _.flatten(_.map(_.range(columns), (column) => _.map(_.range(rows), (row) => {
        var enteredText = savedState[column][row],
            el,
            top,
            left;

        if (enteredText) {
            el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            top = helpers.gridSize(row);
            left = helpers.gridSize(column);

            bonzo(el).attr({
                x: left + textXOffset,
                y: top + textYOffset,
                'class': 'crossword__cell-text'
            }).text(enteredText);

            return [el];
        } else {
            return [];
        }
    })));
}

function init() {
    _.forEach(qwery('.js-crossword-thumbnail'), (elem) => {
        var $elem = bonzo(elem),
            savedState = persistence.loadGridState($elem.attr('data-crossword-id'));

        if (savedState) {
            ajax({
                url: $elem.attr('src'),
                type: 'xml',
                method: 'get',
                crossOrigin: true,
                success: function (data) {
                    var cells = makeTextCells(savedState),
                        svg = qwery('svg', data)[0];
                    bonzo(svg).append(cells);
                    $elem.replaceWith(svg);
                }
            });
        }
    });
}

export default {
    init: init,
    makeTextCells: makeTextCells
};

