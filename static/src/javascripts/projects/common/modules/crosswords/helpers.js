// @flow
import constants from 'common/modules/crosswords/constants';
import findIndex from 'lodash/arrays/findIndex';
import flatten from 'lodash/arrays/flatten';
import first from 'lodash/arrays/first';
import range from 'lodash/arrays/range';
import uniq from 'lodash/arrays/uniq';

const isAcross = clue => clue.direction === 'across';
const getLastCellInClue = clue => {
    const ax = {
        true: 'x',
        false: 'y',
    };
    const axis = ax[isAcross(clue)];
    const otherAxis = ax[!isAcross(clue)];

    const cell = {};
    cell[axis] = clue.position[axis] + (clue.length - 1);
    cell[otherAxis] = clue.position[otherAxis];

    return cell;
};

const isFirstCellInClue = (cell, clue) => {
    const axis = isAcross(clue) ? 'x' : 'y';
    return cell[axis] === clue.position[axis];
};

const isLastCellInClue = (cell, clue) => {
    const axis = isAcross(clue) ? 'x' : 'y';
    return cell[axis] === clue.position[axis] + (clue.length - 1);
};

const getNextClueInGroup = (entries, clue) => {
    const newClueId =
        clue.group[findIndex(clue.group, id => id === clue.id) + 1];
    return entries.find(entry => entry.id === newClueId);
};

const getPreviousClueInGroup = (entries, clue) => {
    const newClueId =
        clue.group[findIndex(clue.group, id => id === clue.id) - 1];
    return entries.find(entry => entry.id === newClueId);
};

const getGroupEntriesForClue = (entries, group) =>
    group.map(clueId => entries.find(entry => entry.id === clueId));

const clueIsInGroup = function clueIsInGroup(clue) {
    return clue.group.length !== 1;
};

const getAllSeparatorsForGroup = clues => {
    const k = {};

    [',', '-'].forEach(separator => {
        let cnt = 0;
        const flattenedSeparators = flatten(
            clues.map(clue => {
                const seps = clue.separatorLocations[separator].map(
                    s => s + cnt
                );
                cnt += clue.length;
                return seps;
            })
        );
        k[separator] = flattenedSeparators;
    });
    return k;
};

const getClueForGroupedEntries = clueGroup => first(clueGroup).clue;

const getNumbersForGroupedEntries = clueGroup => first(clueGroup).humanNumber;

const getTtotalLengthOfGroup = clueGroup =>
    clueGroup.reduce((total, clue) => total + clue.length, 0);

const getAnagramClueData = (entries, clue) => {
    if (clueIsInGroup(clue)) {
        const groupEnts = getGroupEntriesForClue(entries, clue.group);
        return {
            id: clue.id,
            number: getNumbersForGroupedEntries(groupEnts),
            length: getTtotalLengthOfGroup(groupEnts),
            separatorLocations: getAllSeparatorsForGroup(groupEnts),
            direction: '',
            clue: getClueForGroupedEntries(groupEnts),
        };
    }
    return clue;
};

const cluesAreInGroup = (clue, otherClue) => otherClue.group.includes(clue.id);

const cellsForEntry = entry =>
    isAcross(entry)
        ? range(entry.position.x, entry.position.x + entry.length).map(x => ({
              x,
              y: entry.position.y,
          }))
        : range(entry.position.y, entry.position.y + entry.length).map(y => ({
              x: entry.position.x,
              y,
          }));

const checkClueHasBeenAnswered = (grid, entry) =>
    cellsForEntry(entry).every(position =>
        /^[A-Z]$/.test(grid[position.x][position.y].value)
    );

const otherDirection = direction =>
    direction === 'across' ? 'down' : 'across';

const cellsForClue = (entries, clue) => {
    if (clueIsInGroup(clue)) {
        const entriesForClue = getGroupEntriesForClue(entries, clue.group);
        return flatten(entriesForClue.map(entry => cellsForEntry(entry)));
    }
    return cellsForEntry(clue);
};

/** Hash key for the cell at x, y in the clue map */
const clueMapKey = (x, y) => `${x}_${y}`;

const cluesFor = (clueMap, x, y) => clueMap[clueMapKey(x, y)];

const getClearableCellsForEntry = (grid, clueMap, entries, entry) => {
    const direction = entry.direction === 'across' ? 'down' : 'across';
    return cellsForEntry(entry).filter(cell => {
        const clues = cluesFor(clueMap, cell.x, cell.y);
        const otherClue = clues[direction];
        if (otherClue) {
            return (
                cluesAreInGroup(entry, otherClue) ||
                !checkClueHasBeenAnswered(grid, otherClue)
            );
        }
        return true;
    });
};

const getClearableCellsForClue = (grid, clueMap, entries, clue) => {
    if (clueIsInGroup(clue)) {
        const entriesForClue = getGroupEntriesForClue(entries, clue.group);
        return uniq(
            flatten(
                entriesForClue.map(entry =>
                    getClearableCellsForEntry(grid, clueMap, entries, entry)
                )
            ),
            cell => [cell.x, cell.y].join()
        );
    }
    return getClearableCellsForEntry(grid, clueMap, entries, clue);
};

/**
 * Builds the initial state of the grid given the number of rows, columns, and a list of clues.
 */
const buildGrid = (rows, columns, entries, savedState) => {
    const grid = range(columns).map(x =>
        range(rows).map(y => ({
            isHighlighted: false,
            isEditable: false,
            isError: false,
            isAnimating: false,
            value:
                savedState && savedState[x] && savedState[x][y]
                    ? savedState[x][y]
                    : '',
        }))
    );

    entries.forEach(entry => {
        const x = entry.position.x;
        const y = entry.position.y;

        grid[x][y].number = entry.number;

        cellsForEntry(entry).forEach(cell => {
            grid[cell.x][cell.y].isEditable = true;
        });
    });

    return grid;
};

/** A map for looking up clues that a given cell relates to */
const buildClueMap = clues => {
    const map = {};

    clues.forEach(clue => {
        cellsForEntry(clue).forEach(cell => {
            const key = clueMapKey(cell.x, cell.y);

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
const buildSeparatorMap = clues => {
    const flattenReducer = (a, b) => {
        let flattened;

        if (Array.isArray(b) && b.length) {
            flattened = b.reduce(flattenReducer, []);
        }

        return a.concat(flattened);
    };

    return clues
        .map(clue =>
            Object.keys(clue.separatorLocations).map(separator => {
                const locations = clue.separatorLocations[separator];

                return locations.map(location => {
                    const key = isAcross(clue)
                        ? clueMapKey(
                              clue.position.x + location,
                              clue.position.y
                          )
                        : clueMapKey(
                              clue.position.x,
                              clue.position.y + location
                          );

                    return {
                        key,
                        direction: clue.direction,
                        separator,
                    };
                });
            })
        )
        .reduce(flattenReducer, [])
        .reduce((map, d) => {
            if (map[d.key] === undefined) {
                map[d.key] = {};
            }

            map[d.key] = d;

            return map;
        }, {});
};

const entryHasCell = (entry, x, y) =>
    cellsForEntry(entry).some(cell => cell.x === x && cell.y === y);

/** Can be used for width or height, as the cell height == cell width */
const gridSize = cells =>
    cells * (constants.cellSize + constants.borderSize) + constants.borderSize;

const mapGrid = (grid, f) =>
    grid.map((col, x) => col.map((cell, y) => f(cell, x, y)));

export {
    isAcross,
    otherDirection,
    buildGrid,
    clueMapKey,
    cluesFor,
    buildClueMap,
    buildSeparatorMap,
    cellsForEntry,
    cellsForClue,
    entryHasCell,
    gridSize,
    mapGrid,
    getAnagramClueData,
    getLastCellInClue,
    isFirstCellInClue,
    isLastCellInClue,
    getNextClueInGroup,
    getPreviousClueInGroup,
    clueIsInGroup,
    getGroupEntriesForClue,
    getNumbersForGroupedEntries,
    getClueForGroupedEntries,
    getAllSeparatorsForGroup,
    getTtotalLengthOfGroup,
    cluesAreInGroup,
    checkClueHasBeenAnswered,
    getClearableCellsForClue,
};
