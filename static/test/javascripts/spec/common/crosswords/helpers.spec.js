define([
    'common/modules/crosswords/helpers',
    'lodash/collections/every'
], function (
    helpers,
    every) {
    var entryFixture = {
        group: ['2-across'],
        position: {
            x: 2,
            y: 3
        },
        direction: 'across',
        length: 2,
        number: 15,
        solution: 'IT'
    };

    //I've stripped out the values here that aren't used in the methods tested
    var entriesFixture = [
        {id: '7-across', humanNumber: 7, direction: 'across', length: 7, clue: '12 across in curried food business (7)', group: ['7-across'], position: {x: 0, y: 1}, separatorLocations: {}},
        {id: '8-across', humanNumber: 8, direction: 'across', length: 7, clue: 'Lionel, a hot favourite at Christmas? (7)', group: ['8-across'], position: {x: 8, y: 1}, separatorLocations: {}},
        {id: '10-across', humanNumber: 10, direction: 'across', length: 9, clue: 'See 2', group: ['2-down', '10-across', '23-down', '21-across'], position: {x: 5, y: 3}, separatorLocations: {',': [3, 9]}},
        {id: '21-across', humanNumber: 21, direction: 'across', length: 9, clue: 'See 2', group: ['2-down', '10-across', '23-down', '21-across'], position: {x: 1, y: 11}, separatorLocations: {',': [4, 7]}},
        {id: '2-down', humanNumber: '2,10,23,21across', direction: 'down', length: 8, clue:  'Excuse me? Did some old people at any time cause our ruin? Thats a funny revolutionary line (4,4,3,6,4,4,3,2)', group: ['2-down', '10-across', '23-down', '21-across'], position: {x: 3, y: 0}, separatorLocations: { ',': [4, 8]}},
        {id: '21-down', humanNumber: 21, direction: 'down', length: 4, clue: 'Patsys English, looked down on by Irish party (4)', group: ['21-down'], position: {x: 1, y: 11}, separatorLocations: {} },
        {id: '23-down', humanNumber: 23, direction: 'down', length: 4, clue: 'See 2', group: ['2-down', '10-across', '23-down', '21-across'], position: {x: 13, y: 11}, separatorLocations: { ',': [4]}}
    ];

    var groupFixture = [
        {id: '2-down', humanNumber: '2,10,23,21across', direction: 'down', length: 8, clue: 'Excuse me? Did some old people at any time cause our ruin? Thats a funny revolutionary line (4,4,3,6,4,4,3,2)', group: ['2-down', '10-across', '23-down', '21-across'], position: {x: 3, y: 0}, separatorLocations: { ',': [4, 8]}},
        {id: '10-across', humanNumber: 10, direction: 'across', length: 9, clue: 'See 2', group: ['2-down', '10-across', '23-down', '21-across'], position: {x: 5, y: 3}, separatorLocations: { ',': [3, 9]}},
        {id: '23-down', humanNumber: 23, direction: 'down', length: 4, clue: 'See 2', group: ['2-down', '10-across', '23-down', '21-across'], position: {x: 13, y: 11}, separatorLocations: { ',': [4]}},
        {id: '21-across', humanNumber: 21, direction: 'across', length: 9, clue: 'See 2', group: ['2-down', '10-across', '23-down', '21-across'], position: {x: 1, y: 11}, separatorLocations: { ',': [4, 7]}}
    ];


    describe('Helpers', function () {
        describe('isAcross', function () {
            it('should be true for a clue that is "across"', function () {
                expect(helpers.isAcross({
                    direction: 'across'
                })).toBe(true);
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

        describe('clueIsInGroup', function () {
            it('should return false for a entry with a single entry in the group attribute', function () {
                expect(helpers.clueIsInGroup(entryFixture)).toBe(false);
            });

            it('should return true for a entry with multiple entries in the group attribute', function () {
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

        describe('getAnagramClueData', function () {
            it('should return the clue for a non grouped clue', function () {
                expect(helpers.getAnagramClueData(entriesFixture, entryFixture)).toEqual(entryFixture);
            });

            it('should return the correct data when the clue is part of a group', function () {
                var expectedData = {
                    id: '10-across',
                    number: '2,10,23,21across',
                    length: 30,
                    separatorLocations: {',': [4, 8, 11, 17, 21, 25, 28], '-': []},
                    direction: '',
                    clue: 'Excuse me? Did some old people at any time cause our ruin? Thats a funny revolutionary line (4,4,3,6,4,4,3,2)'
                };
                var clue =  {id: '10-across', humanNumber: 10, length: 9, clue: 'See 2', group: ['2-down', '10-across', '23-down', '21-across'], position: {x: 5, y: 3}, separatorLocations: { ',': [3, 9]}};
                expect(helpers.getAnagramClueData(entriesFixture, clue)).toEqual(expectedData);
            });
        });

        describe('getGroupEntriesForClue', function () {
            it('should return the entries for a clue in the group in the correct order', function () {
                var group = ['2-down', '10-across', '23-down', '21-across'];
                expect(helpers.getGroupEntriesForClue(entriesFixture, group)).toEqual(groupFixture);
            });
        });

        describe('getClueForGroupedEntries', function () {
            it('should get the clue for a group', function () {
                var expectedClue = 'Excuse me? Did some old people at any time cause our ruin? Thats a funny revolutionary line (4,4,3,6,4,4,3,2)';
                expect(helpers.getClueForGroupedEntries(groupFixture)).toBe(expectedClue);
            });
        });

        describe('getNumbersForGroupedEntries', function () {
            it('should get correct numerical description for grouped clue', function () {
                var expectedNumber = '2,10,23,21across';
                expect(helpers.getNumbersForGroupedEntries(groupFixture)).toBe(expectedNumber);
            });
        });

        describe('getAllSeparatorsForGroup', function () {
            it('should get the correct separators for the whole clue grouup', function () {
                var expectedSeparators = {',': [4, 8, 11, 17, 21, 25, 28], '-': []};
                expect(helpers.getAllSeparatorsForGroup(groupFixture)).toEqual(expectedSeparators);
            });
        });

        describe('getTtotalLengthOfGroup', function () {
            it('should get the total length of a group', function () {
                expect(helpers.getTtotalLengthOfGroup(groupFixture)).toBe(30);
            });
        });

        describe('cellsForClue', function () {
            it('should return all the cells for a single entry', function () {
                expect(helpers.cellsForClue(entriesFixture, entryFixture)).toEqual([{x: 2, y: 3}, {x: 3, y: 3}]);
            });

            it('should return all cells for a grouped entry', function () {
                var clue = {id: '10-across',
                            humanNumber: 10,
                            length: 9,
                            clue: 'See 2',
                            group: ['2-down', '10-across', '23-down', '21-across'],
                            position: {x: 5, y: 3},
                            separatorLocations: {',': [3, 9]}};

                var expectedCells =  [
                     {x: 3, y: 0}, {x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4}, {x: 3, y: 5},
                     {x: 3, y: 6}, {x: 3, y: 7}, {x: 5, y: 3}, {x: 6, y: 3}, {x: 7, y: 3}, {x: 8, y: 3},
                     {x: 9, y: 3}, {x: 10, y: 3}, {x: 11, y: 3}, {x: 12, y: 3}, {x: 13, y: 3}, {x: 13, y: 11},
                     {x: 13, y: 12}, {x: 13, y: 13}, {x: 13, y: 14}, {x: 1, y: 11}, {x: 2, y: 11}, {x: 3, y: 11},
                     {x: 4, y: 11}, {x: 5, y: 11}, {x: 6, y: 11}, {x: 7, y: 11}, {x: 8, y: 11}, {x: 9, y: 11}
                ];
                expect(helpers.cellsForClue(entriesFixture, clue)).toEqual(expectedCells);
            });
        });

        describe('areCluesInAGroup', function () {
            var thisEntryFixture = {
                id: '2-across',
                group: ['2-across', '10-down']
            };

            var thatEntryFixture = {
                id: '10-down',
                group: ['2-across', '10-down']
            };

            var otherEntryFixture = {
                id: '10-across',
                group: ['10-across', '12-down']
            };

            it('should return true when two clues are part of the same group', function () {
                expect(helpers.cluesAreInGroup(thisEntryFixture, thatEntryFixture)).toBe(true);
            });

            it('should return false when two clues are not part of the same group', function () {
                expect(helpers.cluesAreInGroup(thatEntryFixture, otherEntryFixture)).toBe(false);
            });
        });

        describe('checkClueHasBeenAnswered', function () {

            //This is *really* counter intuitive. If you mock the grid like ths (i've ommted other values i don't need) 'down clues' appear horizontal ( the all have the same x value )
            // I blame berry
            var gridFixture = [
                [{value: 'R'}, {value: 'I'}, {value: 'V'}, {value: 'E'}, {value: 'R'}, {value: ''}],
                [{value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}],
                [{value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}],
                [{value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}],
                [{value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}],
                [{value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}]
            ];

            var answeredEntryFixture = { id: '1-down', solution: 'RIVER', position: { x: 0, y: 0 }, direction: 'down', length: 5 };
            var unAnsweredEntryFixture = { id: '1-across', solution: 'IDIOT', position: { x: 0, y: 1 }, direction: 'across', length: 5 };

            it('should return true when the clue has been answered', function () {
                expect(helpers.checkClueHasBeenAnswered(gridFixture, answeredEntryFixture)).toBe(true);
            });

            it('should return false when the clue has not been answered', function () {
                expect(helpers.checkClueHasBeenAnswered(gridFixture, unAnsweredEntryFixture)).toBe(false);
            });
        });

        describe('getClearableCellsForEntry', function () {

            //Replicates state.grid but with just the value field for a partially completed grid with clues and grouped clues intersecting and not intersecting eachothe
            // 'SANTA CLAUSE', 'NORTHERN LIGHTS' and 'SOUTHERN CROSS' are grouped clues

            /*
               R S       H
               I A  NORTHERN
               V N    A  A
               E T   FIGHTS
               R A    L  H
                      R  E
               CLAUSE O  N
                      A
               LIGHTS D
               U I     C
               S SOUTHERN
               T T     O
               R       S
               E       S
             */

            var gridFixture = [
                [{value: 'R'}, {value: 'I'}, {value: 'V'}, {value: 'E'}, {value: 'R'}, {value: ''}, {value: 'C'}, {value: ''}, {value: 'L'}, {value: 'U'}, {value: 'S'}, {value: 'T'}, {value: 'R'}, {value: 'E'}],
                [{value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: 'L'}, {value: ''}, {value: 'I'}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}],
                [{value: 'S'}, {value: 'A'}, {value: 'N'}, {value: 'T'}, {value: 'A'}, {value: ''}, {value: 'A'}, {value: ''}, {value: 'G'}, {value: 'I'}, {value: 'S'}, {value: 'T'}, {value: ''}, {value: ''}],
                [{value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: 'U'}, {value: ''}, {value: 'H'}, {value: ''}, {value: 'O'}, {value: ''}, {value: ''}, {value: ''}],
                [{value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: 'S'}, {value: ''}, {value: 'T'}, {value: ''}, {value: 'u'}, {value: ''}, {value: ''}, {value: ''}],
                [{value: ''}, {value: 'N'}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: 'E'}, {value: ''}, {value: 'S'}, {value: ''}, {value: 'T'}, {value: ''}, {value: ''}, {value: ''}],
                [{value: ''}, {value: 'O'}, {value: ''}, {value: 'F'}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: 'H'}, {value: ''}, {value: ''}, {value: ''}],
                [{value: ''}, {value: 'R'}, {value: 'A'}, {value: 'I'}, {value: 'L'}, {value: 'R'}, {value: 'O'}, {value: 'A'}, {value: 'D'}, {value: ''}, {value: 'E'}, {value: ''}, {value: ''}, {value: ''}],
                [{value: ''}, {value: 'T'}, {value: ''}, {value: 'G'}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: 'C'}, {value: 'R'}, {value: 'O'}, {value: 'S'}, {value: 'S'}],
                [{value: ''}, {value: 'H'}, {value: ''}, {value: 'H'}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: 'N'}, {value: ''}, {value: ''}, {value: ''}],
                [{value: ''}, {value: 'E'}, {value: ''}, {value: 'T'}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}],
                [{value: ''}, {value: 'R'}, {value: ''}, {value: 'S'}, {value: 'O'}, {value: 'U'}, {value: 'T'}, {value: 'H'}, {value: 'E'}, {value: 'R'}, {value: 'N'}, {value: ''}, {value: ''}, {value: ''}],
                [{value: ''}, {value: 'N'}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}]
            ];

            var oneDownFixture = { id: '1-down', group: ['1-down'], solution: 'RIVER', position: { x: 0, y: 0 }, direction: 'down', length: 5 };
            var twoDownFixture = { id: '2-down', group: ['2-down', '1-across'], solution: 'SANTA', position: { x: 2, y: 0 }, direction: 'down', length: 5 };
            var threeDownFixture = { id: '3-down', group: ['3-down'], solution: 'RAILROAD', position: { x: 7, y: 1 }, direction: 'down', length: 8 };

            //Unanswered clue
            var fourDownFixture = { id: '4-down', group: ['4-down'], solution: 'HEATHEN', position: { x: 10, y: 0 }, direction: 'down', length: 7 };
            var fiveDownFixture = { id: '5-down', group: ['5-down'], solution: 'LUSTRE', position: { x: 0, y: 8 }, direction: 'down', length: 6 };
            var sixDownFixture =  { id: '6-down', group: ['6-down'], solution: 'GIST', position: { x: 2, y: 8 }, direction: 'down', length: 4 };
            var sevenDownFixture = {id: '7-down', group: ['5-across', '7-down'], solution: 'CROSS', position: { x: 8, y: 9 }, direction: 'down', length: 5};

            var oneAcrossFixture = { id: '1-across', group: ['2-down', '1-across'], solution: 'CLAUSE', position: { x: 0, y: 6 }, direction: 'across', length: 6 };
            var twoAcrossFixture = { id: '2-across', group: ['3-across', '2-across'], solution: 'LIGHTS', position: { x: 0, y: 8 }, direction: 'across', length: 6 };
            var threeAcrossFixture = { id: '3-across', group: ['3-across', '2-across'], solution: 'NORTHERN', position: { x: 5, y: 1 }, direction: 'across', length: 8 };


            var fourAcrossFixture = { id: '4-across', group: ['4-across'], solution: 'FIGHTS', position: { x: 6, y: 3 }, direction: 'across', length: 6 };
            var fiveAcrossFixture = { id: '5-across', group: ['5-across', '7-down'], solution: 'SOUTHERN', position: { x: 2, y: 10 }, direction: 'across', length: 8 };

            var theEntriesFixture = [oneDownFixture, twoDownFixture, threeDownFixture, fourDownFixture, fiveDownFixture, sixDownFixture, sevenDownFixture,
                                   oneAcrossFixture, twoAcrossFixture, threeAcrossFixture, fourAcrossFixture, fiveAcrossFixture];

            var clueMapFixture = {

                //RIVER [0,0]
                '0_0': {down: oneDownFixture},
                '0_1': {down: oneDownFixture},
                '0_2': {down: oneDownFixture},
                '0_3': {down: oneDownFixture},
                '0_4': {down: oneDownFixture},

                //SANTA[2,0]
                '2_0': {down: twoDownFixture},
                '2_1': {down: twoDownFixture},
                '2_2': {down: twoDownFixture},
                '2_3': {down: twoDownFixture},
                '2_4': {down: twoDownFixture},

                //RAILROAD[7,1]
                '7_1': {accross: threeAcrossFixture, down: threeDownFixture}, //intersects NORTHERN
                '7_2': {down: threeDownFixture},
                '7_3': {across: fourAcrossFixture, down: threeDownFixture},    //intersects FIGHTS
                '7_4': {down: threeDownFixture},
                '7_5': {down: threeDownFixture},
                '7_6': {down: threeDownFixture},
                '7_7': {down: threeDownFixture},

                //HEATHEN[10,1][
                '10_0': {down: fourDownFixture},
                '10_1': {across: threeAcrossFixture, down: fourDownFixture}, //intersects NORTHERN
                '10_2': {down: fourDownFixture},
                '10_3': {across: fourAcrossFixture, down: fourDownFixture},  //intersects FIGHTS
                '10_4': {down: fourDownFixture},
                '10_5': {down: fourDownFixture},
                '10_6': {down: fourDownFixture},

                //LUSTRE[0.8]
                '0_8': {across: twoAcrossFixture, down: fiveDownFixture}, //intersects LIGHTS
                '0_9': {down: fiveDownFixture},
                '0_10': {down: fiveDownFixture},
                '0_11': {down: fiveDownFixture},
                '0_12': {down: fiveDownFixture},
                '0_13': {down: fiveDownFixture},

                //GIST[0,6]
                '2_8': {across: twoAcrossFixture, down: sixDownFixture }, //intersects GIST
                '2_9': {down: sixDownFixture },
                '2_10': {across: fiveAcrossFixture, down: sixDownFixture }, //Intersects SOUTHERN
                '2_11': {down: sixDownFixture },

                //CLAUSE[0,6]
                '0_6': {across: oneAcrossFixture},
                '1_6': {across: oneAcrossFixture},
                '2_6': {across: oneAcrossFixture},
                '3_6': {across: oneAcrossFixture},
                '4_6': {across: oneAcrossFixture},
                '5_6': {across: oneAcrossFixture},

                //LIGHTS[0,6] - minus 'L' and 'G'
                '1_8': {across: twoAcrossFixture},
                '3_8': {across: twoAcrossFixture},
                '4_8': {across: twoAcrossFixture},
                '5_8': {across: twoAcrossFixture},

                //NORTHERN[5,1] - minus 'O' and 'R'
                '5_1': {across: threeAcrossFixture},
                '6_1': {across: threeAcrossFixture},
                '8_1': {across: threeAcrossFixture},
                '9_1': {across: threeAcrossFixture},
                '11_1': {across: threeAcrossFixture},
                '12_1': {across: threeAcrossFixture},

                //FIGHTS[6,3]  -
                '6_3': {across: fourAcrossFixture},
                '8_3': {across: fourAcrossFixture},
                '9_3': {across: fourAcrossFixture},
                '11_3': {across: fourAcrossFixture},

                //SOUTHERN [x: 2, y: 10][8] 'S' Missing 'R'    OUTHE N
                '3_10': {across: fiveAcrossFixture },
                '4_10': {across: fiveAcrossFixture },
                '5_10': {across: fiveAcrossFixture },
                '6_10': {across: fiveAcrossFixture },
                '7_10': {across: fiveAcrossFixture },
                '9_10': {across: fiveAcrossFixture },

                //CROSS[x: 8, y: 9]
                '8_9': {down: sevenDownFixture },
                '8_10': {across: fiveAcrossFixture, down: sevenDownFixture }, //Intersects SOUTHERN
                '8_11': {down: sevenDownFixture },
                '8_12': {down: sevenDownFixture },
                '8_13': {down: sevenDownFixture }
            };



            // duplicate cells' - a cell which is used by more than one completed clue
            it('should return all cells for an ungrouped clue which does not intersect other answered clues', function () {
                var expectedCells =  [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}];
                expect(helpers.getClearableCellsForClue(gridFixture, clueMapFixture, theEntriesFixture, oneDownFixture)).toEqual(expectedCells);
            });

            //F GHTS because 'RAILROAD' has been answered, because 'HEATHEN' hasnt
            it('should return all correct cells for an ungrouped clue which intersects an unanswered clue', function () {
                var expectedCells = [{x: 6, y: 3}, {x: 8, y: 3}, {x: 9, y: 3}, {x: 10, y: 3}, {x: 11, y: 3}];
                expect(helpers.getClearableCellsForClue(gridFixture, clueMapFixture, theEntriesFixture, fourAcrossFixture)).toEqual(expectedCells);
            });

            //SANTACLAUSE
            it('should return all cells for a grouped clue which does not intersect other answered clues', function () {
                var expectedCells = [
                    {x: 2, y: 0}, {x: 2, y: 1}, {x: 2, y: 2}, {x: 2, y: 3}, {x: 2, y: 4}, {x: 0, y: 6}, {x: 1, y: 6},
                    {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6}
                ];
                expect(helpers.getClearableCellsForClue(gridFixture, clueMapFixture, theEntriesFixture, twoDownFixture)).toEqual(expectedCells);
                expect(helpers.getClearableCellsForClue(gridFixture, clueMapFixture, theEntriesFixture, oneAcrossFixture)).toEqual(expectedCells);
            });

            //NORTHERN 5, 1 LIGHTS  0 8
            //NORTHERN LIGHTS should clear NO THERN  I HTS
            it('should return all cells for a grouped clue which intersects other completed clues', function () {
                var expectedCells =  [
                    {x: 5, y: 1}, {x: 6, y: 1}, {x: 8, y: 1}, {x: 9, y: 1}, {x: 10, y: 1}, {x: 11, y: 1}, {x: 12, y: 1},
                    {x: 1, y: 8}, {x: 3, y: 8}, {x: 4, y: 8}, {x: 5, y: 8}
                ];
                expect(helpers.getClearableCellsForClue(gridFixture, clueMapFixture, theEntriesFixture, twoAcrossFixture)).toEqual(expectedCells);
                expect(helpers.getClearableCellsForClue(gridFixture, clueMapFixture, theEntriesFixture, threeAcrossFixture)).toEqual(expectedCells);
            });

            //SOUTHERN  8, 9, CROSS 8. 9
            //should clear OUTHERN CR SS
            it('should return the correct cells where entries in a grouped clue intersect each other', function () {
                var expectedCells = [
                   {x: 3, y: 10}, {x: 4, y: 10}, {x: 5, y: 10}, {x: 6, y: 10}, {x: 7, y: 10}, {x: 8, y: 10}, {x: 9, y: 10},
                   {x: 8, y: 9}, {x: 8, y: 11}, {x: 8, y: 12}, {x: 8, y: 13}
                ];
                expect(helpers.getClearableCellsForClue(gridFixture, clueMapFixture, theEntriesFixture, fiveAcrossFixture)).toEqual(expectedCells);
                expect(helpers.getClearableCellsForClue(gridFixture, clueMapFixture, theEntriesFixture, sevenDownFixture)).toEqual(expectedCells);

            });
        });
    });
});
