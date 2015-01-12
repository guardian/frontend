define([
    'lodash/collections/every',
    'common/modules/crosswords/helpers'
], function (
    every,
    helpers
) {
    var entryFixture = {
        position: {
            x: 2,
            y: 3
        },
        direction: 'across',
        length: 2,
        number: 15
    };

    describe('Helpers', function () {
        describe('isAcross', function () {
            it('should be true for a clue that is "across"', function () {
                expect(helpers.isAcross({
                    direction: 'across'
                })).toBe(true);
            });

            it('should be false for a clue that is "down"', function () {
                expect(helpers.isAcross({
                    direction: 'down'
                })).toBe(false);
            });
        });

        describe('otherDirection', function () {
            it('should be "across" for "down"', function () {
                expect(helpers.otherDirection('down')).toBe('across');
            });

            it('should be "down" for "across"', function () {
                expect(helpers.otherDirection('across')).toBe('down');
            });
        });

        describe('buildGrid', function () {
            it('should build a grid with the correct number of rows', function () {
                expect(every(helpers.buildGrid(5, 6, []), function (column) {
                    return column.length === 5;
                })).toBe(true);
            });

            it('should build a grid with the correct number of columns', function () {
                expect(helpers.buildGrid(5, 6, []).length).toBe(6);
            });

            it('should set entries to not editable by default', function () {
                var grid = helpers.buildGrid(5, 6, []);

                expect(every(grid, function (column) {
                    return every(column, function (cell) {
                        return cell.isEditable === false;
                    });
                })).toBe(true);
            });

            it('should make cells that belong to an entry editable', function () {
                var grid = helpers.buildGrid(5, 5, [entryFixture]);

                expect(grid[2][3].isEditable).toBe(true);
                expect(grid[3][3].isEditable).toBe(true);
            });

            it('should set the cell number from an entry', function () {
                var grid = helpers.buildGrid(5, 5, [entryFixture]);

                expect(grid[2][3].number).toBe(15);
            });

            it('should set values from the state', function () {
                var grid = helpers.buildGrid(5, 5, [entryFixture], [
                    ['', '', '', '', ''],
                    ['', '', '', '', ''],
                    ['', '', '', 'W', ''],
                    ['', '', '', '', ''],
                    ['', '', '', '', '']
                ]);

                expect(grid[2][3].value).toBe('W');
            });
        });

        describe('clueMapKey', function () {
            it('should join the values with an underscore', function () {
                expect(helpers.clueMapKey(4, 15)).toBe('4_15');
            });
        });

        describe('buildClueMap', function () {
            it('should return a map from cells to entries', function () {
                var clueMap = helpers.buildClueMap([entryFixture]);

                expect(clueMap[helpers.clueMapKey(2, 3)].across).toBe(entryFixture);
                expect(clueMap[helpers.clueMapKey(3, 3)].across).toBe(entryFixture);
            });
        });

        describe('cellsForEntry', function () {
            it('should return all cells belonging to the entry', function () {
                var cells = helpers.cellsForEntry(entryFixture);

                expect(cells.length).toBe(2);

                var firstCell = cells[0];

                expect(firstCell.x).toBe(2);
                expect(firstCell.y).toBe(3);

                var secondCell = cells[1];

                expect(secondCell.x).toBe(3);
                expect(secondCell.y).toBe(3);
            });
        });

        describe('entryHasCell', function () {
            it('should return true for a cell belonging to the entry', function () {
                expect(helpers.entryHasCell(entryFixture, 3, 3)).toBe(true);
            });

            it('should return false for a cell that does not belong to the entry', function () {
                expect(helpers.entryHasCell(entryFixture, 3, 4)).toBe(false);
            });
        });
    });
});
