import _ from 'common/utils/_';
import helpers from 'es6/projects/common/modules/crosswords/helpers';

var entryFixture = {
    group: ['2-across'],
    position: {
        x: 2,
        y: 3
    },
    direction: 'across',
    length: 2,
    number: 15
};

//I've stripped out the values here that aren't used in the methods tested
var entriesFixture = [
    { id: '7-across', humanNumber: 7, length: 7, clue: '12 across in curried food business (7)', group: ['7-across'], position: { x: 0, y: 1}, separatorLocations: {} },
    { id: '8-across', humanNumber: 8, length: 7, clue: 'Lionel, a hot favourite at Christmas? (7)', group: ['8-across'], position: { x: 8, y: 1 }, separatorLocations: {} },
    { id: '10-across', humanNumber: 10, length: 9, clue: 'See 2', group: [ '2-down', '10-across', '23-down', '21-across' ], position: { x: 5, y: 3 }, separatorLocations: { ",": [ 3, 9 ] } },
    { id: '21-across', humanNumber: 21, length: 9, clue: 'See 2', group: [ '2-down', '10-across', '23-down', '21-across' ], position: { x: 1, y: 11 }, separatorLocations: { ",": [ 4, 7 ] } },
    { id: '2-down', humanNumber: '2,10,23,21across', length: 8, clue:  'Excuse me? Did some old people at any time cause our ruin? Thats a funny revolutionary line (4,4,3,6,4,4,3,2)', group: [ '2-down', '10-across', '23-down', '21-across' ], position: { x: 3, y: 0 }, separatorLocations: { ",": [ 4, 8 ] } },
    { id: '21-down', humanNumber: 21, length: 4, clue: 'Patsys English, looked down on by Irish party (4)', group: [ '21-down' ], position: { x: 1, y: 11 }, separatorLocations: {} },
    { id: '23-down', humanNumber: 23, length: 4, clue: 'See 2', group: [ '2-down', '10-across', '23-down', '21-across' ], position: { x: 13, y: 11 }, separatorLocations: { ",": [ 4 ] } }
]

var groupFixture = [
    { id: '2-down', humanNumber: '2,10,23,21across', length: 8, clue:  'Excuse me? Did some old people at any time cause our ruin? Thats a funny revolutionary line (4,4,3,6,4,4,3,2)', group: [ '2-down', '10-across', '23-down', '21-across' ], position: { x: 3, y: 0 }, separatorLocations: { ",": [ 4, 8 ] } },
    { id: '10-across', humanNumber: 10, length: 9, clue: 'See 2', group: [ '2-down', '10-across', '23-down', '21-across' ], position: { x: 5, y: 3 }, separatorLocations: { ",": [ 3, 9 ] } },
    { id: '23-down', humanNumber: 23, length: 4, clue: 'See 2', group: [ '2-down', '10-across', '23-down', '21-across' ], position: { x: 13, y: 11 }, separatorLocations: { ",": [ 4 ] } },
    { id: '21-across', humanNumber: 21, length: 9, clue: 'See 2', group: [ '2-down', '10-across', '23-down', '21-across' ], position: { x: 1, y: 11 }, separatorLocations: { ",": [ 4, 7 ] } },
]


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
            expect(_.every(helpers.buildGrid(5, 6, []), function (column) {
                return column.length === 5;
            })).toBe(true);
        });

        it('should build a grid with the correct number of columns', function () {
            expect(helpers.buildGrid(5, 6, []).length).toBe(6);
        });

        it('should set entries to not editable by default', function () {
            var grid = helpers.buildGrid(5, 6, []);

            expect(_.every(grid, function (column) {
                return _.every(column, function (cell) {
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

    describe('clueIsInGroup', function() {
        it('should return false for a entry with a single entry in the group attribute', function() {
            expect(helpers.clueIsInGroup(entryFixture)).toBe(false);
        });

        it('should return true for a entry with multiple entries in the group attribute', function() {
            var entryFixtureWithGroup = {
                group: ['2-across', '15 accross'],
                position: {
                    x: 2,
                    y: 3
                },
                direction: 'across',
                length: 2,
                number: 2
            };
           expect(helpers.clueIsInGroup(entryFixtureWithGroup)).toBe(true);
        });
    });

    describe('getAnagramClueData', function() {
        it('should return the clue for a non grouped clue', function() {
            expect(helpers.getAnagramClueData(entriesFixture, entryFixture)).toEqual(entryFixture);
        });

        it('should return the correct data when the clue is part of a group', function(){
           var expectedData = {
               id: '10-across',
               number : '2,10,23,21across',
               separatorLocations : {",": [ 4, 8, 11, 17, 21, 25, 28 ], "-":[]},
               direction: '',
               clue : 'Excuse me? Did some old people at any time cause our ruin? Thats a funny revolutionary line (4,4,3,6,4,4,3,2)'
           };
           var clue =  { id: '10-across', humanNumber: 10, length: 9, clue: 'See 2', group: [ '2-down', '10-across', '23-down', '21-across' ], position: { x: 5, y: 3 }, separatorLocations: { ",": [ 3, 9 ] } };
           expect(helpers.getAnagramClueData(entriesFixture, clue)).toEqual(expectedData);

        });
    });

    describe('getGroupEntriesForClue', function(){
        it('should return the entries for a clue in the group in the correct order', function() {
            var group = [ '2-down', '10-across', '23-down', '21-across' ];
            expect(helpers.getGroupEntriesForClue(entriesFixture, group)).toEqual(groupFixture);
        });
    });

    describe('getClueForGroupedEntries', function(){
        it('should get the clue for a group', function(){
           var clue = 'Excuse me? Did some old people at any time cause our ruin? Thats a funny revolutionary line (4,4,3,6,4,4,3,2)';
           expect(helpers.getClueForGroupedEntries(groupFixture)).toBe(clue)
        });
    });

   describe('getNumbersForGroupedEntries', function(){
        it('should get correct numerical description for grouped clue', function(){
           var number = '2,10,23,21across';
           expect(helpers.getNumbersForGroupedEntries(groupFixture)).toBe(number)
        });
    });

    describe('getAllSeparatorsForGroup', function(){
       it('should get the correct separators for the whole clue grouup', function(){
           var expectedSeparators = {",": [ 4, 8, 11, 17, 21, 25, 28 ], "-":[]};
           expect(helpers.getAllSeparatorsForGroup(groupFixture)).toEqual(expectedSeparators);
       });
    });

    describe('cellsForClue', function() {
        it("should return all the cells for a single entry", function(){
            expect(helpers.cellsForClue(entriesFixture, entryFixture)).toEqual([{x: 2, y: 3}, {x: 3, y: 3}]);
        });

        it("should return all cells for a single entry",function(){
            var clue = { id: '10-across',
                         humanNumber: 10,
                         length: 9,
                         clue: 'See 2',
                         group: [ '2-down', '10-across', '23-down', '21-across' ],
                         position: { x: 5, y: 3 },
                         separatorLocations: { ",": [ 3, 9 ] } }

            var expectedCells =  [
                {x:3,y:0}, {x:3,y:1}, {x:3,y:2}, {x:3,y:3}, {x:3,y:4}, {x:3,y:5},
                {x:3,y:6}, {x:3,y:7}, {x:5,y:3}, {x:6,y:3}, {x:7,y:3}, {x:8,y:3},
                {x:9,y:3}, {x:10,y:3}, {x:11,y:3}, {x:12,y:3}, {x:13,y:3}, {x:13,y:11},
                {x:13,y:12}, {x:13,y:13}, {x:13,y:14}, {x:1,y:11}, {x:2,y:11}, {x:3,y:11},
                {x:4,y:11}, {x:5,y:11}, {x:6,y:11}, {x:7,y:11}, {x:8,y:11}, {x:9,y:11}
            ]
            expect(helpers.cellsForClue(entriesFixture, entryFixture)).toEqual([{x: 2, y: 3}, {x: 3, y: 3}]);

        });
   });







});
