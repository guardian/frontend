import { constants } from 'common/modules/crosswords/constants';
import flattenDeep from 'lodash/flattenDeep';
import range from 'lodash/range';
import uniqBy from 'lodash/uniqBy';

const isAcross = (clue) => clue.direction === 'across';

const getLastCellInClue = (clue) => {
    const ax = {
        true: 'x',
        false: 'y',
    };
    const axis = ax[String(isAcross(clue))];
    const otherAxis = ax[String(!isAcross(clue))];
    const cell = {
        [axis]: clue.position[axis] + (clue.length - 1),
        [otherAxis]: clue.position[otherAxis],
    };

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
        clue.group[clue.group.findIndex(id => id === clue.id) + 1];

    return entries.find(entry => entry.id === newClueId);
};

const getPreviousClueInGroup = (entries, clue) => {
    const newClueId =
        clue.group[clue.group.findIndex(id => id === clue.id) - 1];

    return entries.find(entry => entry.id === newClueId);
};

const getGroupEntriesForClue = (
    entries,
    group
) =>
    group.reduce((acc, clueId) => {
        const entry = entries.find(e => e.id === clueId);

        if (entry) {
            acc.push(entry);
        }

        return acc;
    }, []);

const clueIsInGroup = (clue) => clue.group.length !== 1;

const getAllSeparatorsForGroup = (clues) => {
    const k = {};

    [',', '-'].forEach(separator => {
        let cnt = 0;
        const flattenedSeparators = flattenDeep(
            clues.map(clue => {
                const separatorLocations =
                    clue.separatorLocations[separator] || [];
                const seps = separatorLocations.map(s => s + cnt);

                cnt += clue.length;

                return seps;
            })
        );
        k[separator] = flattenedSeparators;
    });

    return k;
};

const getClueForGroupedEntries = (clueGroup) =>
    clueGroup[0].clue;

const getNumbersForGroupedEntries = (clueGroup) =>
    clueGroup[0].humanNumber;

const getTtotalLengthOfGroup = (clueGroup) =>
    clueGroup.reduce((total, clue) => total + clue.length, 0);

const getAnagramClueData = (
    entries,
    clue
) => {
    if (clueIsInGroup(clue)) {
        const groupEnts = getGroupEntriesForClue(entries, clue.group);
        const groupClue = {
            id: clue.id,
            number: getNumbersForGroupedEntries(groupEnts),
            length: getTtotalLengthOfGroup(groupEnts),
            separatorLocations: getAllSeparatorsForGroup(groupEnts),
            direction: '',
            clue: getClueForGroupedEntries(groupEnts),
        };

        return groupClue;
    }

    return clue;
};

const cluesAreInGroup = (clue, otherClue) =>
    otherClue.group.includes(clue.id);

const cellsForEntry = (entry) =>
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
        /^.$/.test(grid[position.x][position.y].value)
    );

const otherDirection = (direction) =>
    direction === 'across' ? 'down' : 'across';

const cellsForClue = (entries, clue) => {
    if (clueIsInGroup(clue)) {
        const entriesForClue = getGroupEntriesForClue(entries, clue.group);

        return flattenDeep(entriesForClue.map(entry => cellsForEntry(entry)));
    }

    return cellsForEntry(clue);
};

/** Hash key for the cell at x, y in the clue map */
const clueMapKey = (x, y) => `${x}_${y}`;

const cluesFor = (clueMap, x, y) =>
    clueMap[clueMapKey(x, y)];

const getClearableCellsForEntry = (
    grid,
    clueMap,
    entries,
    entry
) => {
    const direction = otherDirection(entry.direction);

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

const getClearableCellsForClue = (
    grid,
    clueMap,
    entries,
    clue
) => {
    if (clueIsInGroup(clue)) {
        const entriesForClue = getGroupEntriesForClue(entries, clue.group);
        return uniqBy(
            flattenDeep(
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
const buildGrid = (
    rows,
    columns,
    entries,
    savedState
) => {
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
        const { x, y } = entry.position;

        grid[x][y].number = entry.number;

        cellsForEntry(entry).forEach(cell => {
            grid[cell.x][cell.y].isEditable = true;
        });
    });

    
    return grid;
};

/** A map for looking up clues that a given cell relates to */
const buildClueMap = (clues) => {
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
const buildSeparatorMap = (clues) => {
    const flattenReducer = (acc, curr) => {
        let flattened = curr;

        if (Array.isArray(flattened) && flattened.length) {
            flattened = flattened.reduce(flattenReducer, []);
        }

        return acc.concat(flattened);
    };

    return clues
        .map(clue =>
            Object.keys(clue.separatorLocations).map(separatorStr => {
                const separator = (separatorStr);
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
            if (!d) {
                return map;
            }

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
const gridSize = (cells) =>
    cells * (constants.cellSize + constants.borderSize) + constants.borderSize;

const mapGrid = (
    grid,
    f
) => grid.map((col, x) => col.map((cell, y) => f(cell, x, y)));

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
