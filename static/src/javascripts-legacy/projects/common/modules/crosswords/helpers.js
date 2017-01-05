define([
    './constants',
    'lodash/arrays/findIndex',
    'lodash/collections/find',
    'lodash/collections/map',
    'lodash/collections/forEach',
    'lodash/arrays/flatten',
    'lodash/arrays/first',
    'lodash/collections/reduce',
    'lodash/collections/contains',
    'lodash/collections/every',
    'lodash/arrays/range',
    'lodash/arrays/uniq',
    'lodash/collections/filter',
    'lodash/collections/some',
    'common/utils/chain'
], function (
    constants,
    findIndex,
    find,
    map,
    forEach,
    flatten,
    first,
    reduce,
    contains,
    every,
    range,
    uniq,
    filter,
    some,
    chain
) {
    var isAcross = function (clue) {
        return clue.direction === 'across';
    };
    var getLastCellInClue = function (clue) {
        var ax = {
            'true': 'x',
            'false': 'y'
        };
        var axis = ax[isAcross(clue)];
        var otherAxis = ax[!isAcross(clue)];

        var cell = {};
        cell[axis] = clue.position[axis] + (clue.length - 1);
        cell[otherAxis] = clue.position[otherAxis];

        return cell;
    };

    var isFirstCellInClue = function (cell, clue) {
        var axis = isAcross(clue) ? 'x' : 'y';
        return cell[axis] === clue.position[axis];
    };

    var isLastCellInClue = function (cell, clue) {
        var axis = isAcross(clue) ? 'x' : 'y';
        return cell[axis] === clue.position[axis] + (clue.length - 1);
    };

    var getNextClueInGroup = function (entries, clue) {
        var newClueId = clue.group[findIndex(clue.group, function (id) {
            return id === clue.id;
        }) + 1];
        return find(entries, {
            id: newClueId
        });
    };

    var getPreviousClueInGroup = function (entries, clue) {
        var newClueId = clue.group[findIndex(clue.group, function (id) {
            return id === clue.id;
        }) - 1];
        return find(entries, {
            id: newClueId
        });
    };

    var getGroupEntriesForClue = function (entries, group) {
        return map(group, function (clueId) {
            return find(entries, {
                id: clueId
            });
        });
    };

    var clueIsInGroup = function clueIsInGroup(clue) {
        return clue.group.length !== 1;
    };

    var getAllSeparatorsForGroup = function (clues) {

        var k = {};

        forEach([',', '-'], function (separator) {
            var cnt = 0;
            var flattenedSeparators = flatten(map(clues, function (clue) {
                var seps = map(clue.separatorLocations[separator], function (s) {
                    return s + cnt;
                });
                cnt += clue.length;
                return seps;
            }));
            k[separator] = flattenedSeparators;
        });
        return k;
    };

    var getClueForGroupedEntries = function (clueGroup) {
        return first(clueGroup).clue;
    };

    var getNumbersForGroupedEntries = function (clueGroup) {
        return first(clueGroup).humanNumber;
    };

    var getTtotalLengthOfGroup = function (clueGroup) {
        var length = reduce(clueGroup, function (total, clue) {
            var t = total += clue.length;
            return t;
        }, 0);
        return length;
    };

    var getAnagramClueData = function (entries, clue) {
        if (clueIsInGroup(clue)) {
            var groupEnts = getGroupEntriesForClue(entries, clue.group);
            return {
                id: clue.id,
                number: getNumbersForGroupedEntries(groupEnts),
                length: getTtotalLengthOfGroup(groupEnts),
                separatorLocations: getAllSeparatorsForGroup(groupEnts),
                direction: '',
                clue: getClueForGroupedEntries(groupEnts)
            };
        }
        return clue;
    };

    var cluesAreInGroup = function (clue, otherClue) {
        return contains(otherClue.group, clue.id);
    };

    var cellsForEntry = function (entry) {
        return isAcross(entry) ? map(range(entry.position.x, entry.position.x + entry.length), function (x) {
            return {
                x: x,
                y: entry.position.y
            };
        }) : map(range(entry.position.y, entry.position.y + entry.length), function (y) {
            return {
                x: entry.position.x,
                y: y
            };
        });
    };

    var checkClueHasBeenAnswered = function (grid, entry) {
        return every(cellsForEntry(entry), function (position) {
            return (/^[A-Z]$/.test(grid[position.x][position.y].value));
        });
    };

    var otherDirection = function (direction) {
        return direction === 'across' ? 'down' : 'across';
    };

    var cellsForClue = function (entries, clue) {
        if (clueIsInGroup(clue)) {
            var entriesForClue = getGroupEntriesForClue(entries, clue.group);
            return flatten(map(entriesForClue, function (entry) {
                return cellsForEntry(entry);
            }));
        } else {
            return cellsForEntry(clue);
        }
    };

    /** Hash key for the cell at x, y in the clue map */
    var clueMapKey = function (x, y) {
        return x + '_' + y;
    };

    var cluesFor = function (clueMap, x, y) {
        return clueMap[clueMapKey(x, y)];
    };

    var getClearableCellsForEntry = function (grid, clueMap, entries, entry) {
        var direction = entry.direction === 'across' ? 'down' : 'across';
        return filter(cellsForEntry(entry), function (cell) {
            var clues = cluesFor(clueMap, cell.x, cell.y);
            var otherClue = clues[direction];
            if (otherClue) {
                return cluesAreInGroup(entry, otherClue) || !checkClueHasBeenAnswered(grid, otherClue);
            }
            return true;
        });
    };

    var getClearableCellsForClue = function (grid, clueMap, entries, clue) {
        if (clueIsInGroup(clue)) {
            var entriesForClue = getGroupEntriesForClue(entries, clue.group);
            return uniq(flatten(map(entriesForClue, function (entry) {
                return getClearableCellsForEntry(grid, clueMap, entries, entry);
            })), function (cell) {
                return [cell.x, cell.y].join();
            });
        } else {
            return getClearableCellsForEntry(grid, clueMap, entries, clue);
        }
    };

    /**
     * Builds the initial state of the grid given the number of rows, columns, and a list of clues.
     */
    var buildGrid = function (rows, columns, entries, savedState) {
        var grid = map(range(columns), function (x) {
            return map(range(rows), function (y) {
                return {
                    isHighlighted: false,
                    isEditable: false,
                    isError: false,
                    isAnimating: false,
                    value: savedState && savedState[x] && savedState[x][y] ? savedState[x][y] : ''
                };
            });
        });

        forEach(entries, function (entry) {
            var x = entry.position.x;
            var y = entry.position.y;

            grid[x][y].number = entry.number;

            forEach(cellsForEntry(entry), function (cell) {
                grid[cell.x][cell.y].isEditable = true;
            });
        });

        return grid;
    };

    /** A map for looking up clues that a given cell relates to */
    var buildClueMap = function (clues) {
        var map = {};

        forEach(clues, function (clue) {
            forEach(cellsForEntry(clue), function (cell) {
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
    };

    /** A map for looking up separators (i.e word or hyphen) that a given cell relates to */
    var buildSeparatorMap = function (clues) {
        return chain(clues).and(map, function (clue) {
            return map(clue.separatorLocations, function (locations, separator) {
                return locations.map(function (location) {
                    var key = isAcross(clue) ? clueMapKey(clue.position.x + location, clue.position.y) : clueMapKey(clue.position.x, clue.position.y + location);

                    return {
                        key: key,
                        direction: clue.direction,
                        separator: separator
                    };
                });
            });
        }).and(flatten).and(reduce, function (map, d) {
            if (map[d.key] === undefined) {
                map[d.key] = {};
            }

            map[d.key][d.direction] = d.separator;

            return map;
        }, {}).value();
    };

    var entryHasCell = function (entry, x, y) {
        return some(cellsForEntry(entry), function (cell) {
            return cell.x === x && cell.y === y;
        });
    };

    /** Can be used for width or height, as the cell height == cell width */
    var gridSize = function (cells) {
        return cells * (constants.cellSize + constants.borderSize) + constants.borderSize;
    };

    var mapGrid = function (grid, f) {
        return map(grid, function (col, x) {
            return map(col, function (cell, y) {
                return f(cell, x, y);
            });
        });
    };

    return {
        isAcross: isAcross,
        otherDirection: otherDirection,
        buildGrid: buildGrid,
        clueMapKey: clueMapKey,
        cluesFor: cluesFor,
        buildClueMap: buildClueMap,
        buildSeparatorMap: buildSeparatorMap,
        cellsForEntry: cellsForEntry,
        cellsForClue: cellsForClue,
        entryHasCell: entryHasCell,
        gridSize: gridSize,
        mapGrid: mapGrid,
        getAnagramClueData: getAnagramClueData,
        getLastCellInClue: getLastCellInClue,
        isFirstCellInClue: isFirstCellInClue,
        isLastCellInClue: isLastCellInClue,
        getNextClueInGroup: getNextClueInGroup,
        getPreviousClueInGroup: getPreviousClueInGroup,
        clueIsInGroup: clueIsInGroup,
        getGroupEntriesForClue: getGroupEntriesForClue,
        getNumbersForGroupedEntries: getNumbersForGroupedEntries,
        getClueForGroupedEntries: getClueForGroupedEntries,
        getAllSeparatorsForGroup: getAllSeparatorsForGroup,
        getTtotalLengthOfGroup: getTtotalLengthOfGroup,
        cluesAreInGroup: cluesAreInGroup,
        checkClueHasBeenAnswered: checkClueHasBeenAnswered,
        getClearableCellsForClue: getClearableCellsForClue
    };
});
