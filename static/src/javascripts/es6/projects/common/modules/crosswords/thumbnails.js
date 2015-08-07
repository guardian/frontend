import _ from 'common/utils/_';
import bonzo from 'bonzo';
import qwery from 'qwery';
import ajax from 'common/utils/ajax';
import fastdom from 'fastdom';

import helpers from './helpers';
import persistence from './persistence';

const textXOffset = 10;
const textYOffset = 21;

function makeTextCells(savedState) {
    const columns = savedState.length;
    const rows = savedState[0].length;

    return _.flatten(_.map(_.range(columns), (column) => _.map(_.range(rows), (row) => {
        const enteredText = savedState[column][row];

        if (enteredText) {
            const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            const top = helpers.gridSize(row);
            const left = helpers.gridSize(column);

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
    const thumbnails = qwery('.js-crossword-thumbnail');

    if (thumbnails.length) {
        _.forEach(thumbnails, (elem) => {
            const $elem = bonzo(elem);
            const savedState = persistence.loadGridState($elem.attr('data-crossword-id'));

            if (savedState) {
                ajax({
                    url: $elem.attr('src'),
                    type: 'xml',
                    method: 'get',
                    crossOrigin: true,
                    success (data) {
                        const cells = makeTextCells(savedState);
                        const svg = qwery('svg', data)[0];
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

export default {
    init: init,
    makeTextCells: makeTextCells
};

