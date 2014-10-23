define([
    'common/utils/_'
], function (
    _
) {
    function isAcross(clue) {
        return clue.direction === 'across';
    }

    function otherDirection(direction) {
        return direction === 'across' ? 'down' : 'across';
    }

    /**
     * Builds the initial state of the grid given the number of rows, columns, and a list of clues.
     */
    function buildGrid(rows, columns, entries, savedState) {
        var grid = _.map(_.range(columns), function (x) {
            return _.map(_.range(rows), function (y) {
                return {
                    isHighlighted: false,
                    isEditable: false,
                    isError: false,
                    isAnimating: false,
                    value: (savedState && savedState[x] && savedState[x][y]) ? savedState[x][y] : ''
                };
            });
        });

        _.forEach(entries, function (entry) {
            var x = entry.position.x,
                y = entry.position.y;

            grid[x][y].number = entry.number;

            _.forEach(cellsForEntry(entry), function (cell) {
                grid[cell.x][cell.y].isEditable = true;
            });
        });

        return grid;
    }

    /** Hash key for the cell at x, y in the clue map */
    function clueMapKey(x, y) {
        return x + '_' + y;
    }

    /** A map for looking up clues that a given cell relates to */
    function buildClueMap(clues) {
        var map = {};

        _.forEach(clues, function (clue) {
            _.forEach(cellsForEntry(clue), function (cell) {
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

    function cellsForEntry(entry) {
        if (isAcross(entry)) {
            return _.map(_.range(entry.position.x, entry.position.x + entry.length), function (x) {
                return {
                    x: x,
                    y: entry.position.y
                };
            });
        } else {
            return _.map(_.range(entry.position.y, entry.position.y + entry.length), function (y) {
                return {
                    x: entry.position.x,
                    y: y
                };
            });
        }
    }

    function entryHasCell(entry, x, y) {
        return _.any(cellsForEntry(entry), function (cell) {
            return cell.x === x && cell.y === y;
        });
    }

    return {
        isAcross: isAcross,
        otherDirection: otherDirection,
        buildGrid: buildGrid,
        clueMapKey: clueMapKey,
        buildClueMap: buildClueMap,
        cellsForEntry: cellsForEntry,
        entryHasCell: entryHasCell
    };
});
