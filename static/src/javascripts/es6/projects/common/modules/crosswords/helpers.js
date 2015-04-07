import _ from 'common/utils/_';

import constants from 'es6/projects/common/modules/crosswords/constants';

const isAcross = (clue) => clue.direction === 'across';

const otherDirection = (direction) => direction === 'across' ? 'down' : 'across';

/**
 * Builds the initial state of the grid given the number of rows, columns, and a list of clues.
 */
const buildGrid = (rows, columns, entries, savedState) => {
    var grid = _.map(_.range(columns), (x) => _.map(_.range(rows), (y) => ({
        isHighlighted: false,
        isEditable: false,
        isError: false,
        isAnimating: false,
        value: (savedState && savedState[x] && savedState[x][y]) ? savedState[x][y] : ''
    })));

    _.forEach(entries, (entry) => {
        var x = entry.position.x,
            y = entry.position.y;

        grid[x][y].number = entry.number;

        _.forEach(cellsForEntry(entry), (cell) => {
            grid[cell.x][cell.y].isEditable = true;
        });
    });

    return grid;
}

/** Hash key for the cell at x, y in the clue map */
const clueMapKey = (x, y) => `${x}_${y}`;

/** A map for looking up clues that a given cell relates to */
const buildClueMap = (clues) => {
    var map = {};

    _.forEach(clues, (clue) => {
        _.forEach(cellsForEntry(clue), (cell) => {
            var key = clueMapKey(cell.x, cell.y);

            if (map[key] === undefined) {
                map[key] = {};
            }

            if (isAcross(clue)) {
                map[key].across = clue;
            } else {
                map[key].down = clue;
            }
        });
    });

    return map;
}

const cellsForEntry = (entry) => isAcross(entry) ?
    _.map(_.range(entry.position.x, entry.position.x + entry.length), (x) => ({
        x: x,
        y: entry.position.y
    })) :
    _.map(_.range(entry.position.y, entry.position.y + entry.length), (y) => ({
        x: entry.position.x,
        y: y
    }));

const entryHasCell = (entry, x, y) => _.any(cellsForEntry(entry), (cell) => cell.x === x && cell.y === y);

/** Can be used for width or height, as the cell height == cell width */
const gridSize = (cells) => cells * (constants.cellSize + constants.borderSize) + constants.borderSize;

export default {
    isAcross: isAcross,
    otherDirection: otherDirection,
    buildGrid: buildGrid,
    clueMapKey: clueMapKey,
    buildClueMap: buildClueMap,
    cellsForEntry: cellsForEntry,
    entryHasCell: entryHasCell,
    gridSize: gridSize
};
