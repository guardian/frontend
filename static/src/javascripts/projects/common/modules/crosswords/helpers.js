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
    function buildGrid(rows, columns, entries) {
        var grid = _.map(_.range(columns), function () {
            return _.map(_.range(rows), function () {
                return {
                    isHighlighted: false,
                    isEditable: false
                };
            });
        });

        _.forEach(entries, function (entry) {
            var x = entry.position.x,
                y = entry.position.y;

            grid[x][y].number = entry.number;

            _.forEach(cellsApplicable(entry), function (cell) {
                grid[cell.x][cell.y].isEditable = true;
            });
        });

        return grid;
    }

    /**
     * Given a crossword entry, returns the coordinates of all the cells over which the answer
     * must be written
     */
    function cellsApplicable(entry) {
        var x = entry.position.x,
            y = entry.position.y,
            xDelta = 0,
            yDelta = 0,
            cells = [];

        if (isAcross(entry)) {
            xDelta = 1;
        } else {
            yDelta = 1;
        }

        _.forEach(_.range(entry.length), function (n) {
            var x1 = x, y1 = y;

            x1 += xDelta * n;
            y1 += yDelta * n;

            cells.push({
                x: x1,
                y: y1
            });
        });

        return cells;
    }

    /** Hash key for the cell at x, y in the clue map */
    function clueMapKey(x, y) {
        return x + '_' + y;
    }

    /** A map for looking up clues that a given cell relates to */
    function buildClueMap(clues) {
        var map = {};

        _.forEach(clues, function (clue) {
            _.forEach(cellsApplicable(clue), function (cell) {
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

    return {
        isAcross: isAcross,
        otherDirection: otherDirection,
        buildGrid: buildGrid,
        cellsApplicable: cellsApplicable,
        clueMapKey: clueMapKey,
        buildClueMap: buildClueMap
    };
});
