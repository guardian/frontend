
define([
    'helpers/injector'
], function (
    Injector
) {

    // This stuff comes out of CAPI normally

    var CROSSWORD_MOCK_DATA = {

        'name': 'Cryptic crossword No 27,038',
        'type': 'cryptic',
        'number': 27038,
        'date': '2016-11-10T00:00:00Z',
        'dimensions': {
            'cols': 15,
            'rows': 15
        },
        'entries': [
            {
                'id': '1-across',
                'number': 1,
                'humanNumber': '1',
                'direction': 'across',
                'position': {
                    'x': 0,
                    'y': 0
                },
                'separatorLocations': {
                    ',': [
                        3,
                        7,
                        10
                    ]
                },
                'length': 15,
                'clue': '12.5% too much in a pub (3,4,3,5)',
                'group': [
                    '1-across'
                ],
                'solution': 'ONEOVERTHEEIGHT',
                'format': '3,4,3,5'
            },
            {
                'id': '9-across',
                'number': 9,
                'humanNumber': '9',
                'direction': 'across',
                'position': {
                    'x': 0,
                    'y': 2
                },
                'separatorLocations': {},
                'length': 9,
                'clue': 'Leave time to visit cities rebuilt in vain (9)',
                'group': [
                    '9-across'
                ],
                'solution': 'EGOTISTIC',
                'format': '9'
            },
            {
                'id': '10-across',
                'number': 10,
                'humanNumber': '10',
                'direction': 'across',
                'position': {
                    'x': 10,
                    'y': 2
                },
                'separatorLocations': {},
                'length': 5,
                'clue': 'Fancy grocer\'s stealing hearts in Asian city (5)',
                'group': [
                    '10-across'
                ],
                'solution': 'DELHI',
                'format': '5'
            },
            {
                'id': '11-across',
                'number': 11,
                'humanNumber': '11',
                'direction': 'across',
                'position': {
                    'x': 0,
                    'y': 4
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Drink Guardian keeps providing for swimmer (7)',
                'group': [
                    '11-across'
                ],
                'solution': 'ALEWIFE',
                'format': '7'
            },
            {
                'id': '12-across',
                'number': 12,
                'humanNumber': '12',
                'direction': 'across',
                'position': {
                    'x': 8,
                    'y': 4
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Smoker getting sack over complaint (7)',
                'group': [
                    '12-across'
                ],
                'solution': 'LUMBAGO',
                'format': '7'
            },
            {
                'id': '13-across',
                'number': 13,
                'humanNumber': '13',
                'direction': 'across',
                'position': {
                    'x': 6,
                    'y': 5
                },
                'separatorLocations': {},
                'length': 3,
                'clue': 'Club dropping marks for good service (3)',
                'group': [
                    '13-across'
                ],
                'solution': 'ACE',
                'format': '3'
            },
            {
                'id': '14-across',
                'number': 14,
                'humanNumber': '14',
                'direction': 'across',
                'position': {
                    'x': 0,
                    'y': 6
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Illumination is found around start of darkness (7)',
                'group': [
                    '14-across'
                ],
                'solution': 'INSIGHT',
                'format': '7'
            },
            {
                'id': '17-across',
                'number': 17,
                'humanNumber': '17',
                'direction': 'across',
                'position': {
                    'x': 8,
                    'y': 6
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Proof one\'s settled right round westward part (7)',
                'group': [
                    '17-across'
                ],
                'solution': 'RECEIPT',
                'format': '7'
            },
            {
                'id': '19-across',
                'number': 19,
                'humanNumber': '19',
                'direction': 'across',
                'position': {
                    'x': 0,
                    'y': 8
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Rancour? Yes, unfortunately, where there was compulsive rowing (7)',
                'group': [
                    '19-across'
                ],
                'solution': 'GALLEYS',
                'format': '7'
            },
            {
                'id': '22-across',
                'number': 22,
                'humanNumber': '22',
                'direction': 'across',
                'position': {
                    'x': 8,
                    'y': 8
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Lesbian, maybe French girl, goes through Channel regularly (7)',
                'group': [
                    '22-across'
                ],
                'solution': 'HELLENE',
                'format': '7'
            },
            {
                'id': '24-across',
                'number': 24,
                'humanNumber': '24',
                'direction': 'across',
                'position': {
                    'x': 6,
                    'y': 9
                },
                'separatorLocations': {},
                'length': 3,
                'clue': 'Overseas, China\'s capital spanning miles (3)',
                'group': [
                    '24-across'
                ],
                'solution': 'AMI',
                'format': '3'
            },
            {
                'id': '25-across',
                'number': 25,
                'humanNumber': '25',
                'direction': 'across',
                'position': {
                    'x': 0,
                    'y': 10
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Barmy army boxes tough cockney: a bit of a spar (7)',
                'group': [
                    '25-across'
                ],
                'solution': 'YARDARM',
                'format': '7'
            },
            {
                'id': '26-across',
                'number': 26,
                'humanNumber': '26',
                'direction': 'across',
                'position': {
                    'x': 8,
                    'y': 10
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Olympic city\'s head returned greeting abroad (7)',
                'group': [
                    '26-across'
                ],
                'solution': 'BONSOIR',
                'format': '7'
            },
            {
                'id': '28-across',
                'number': 28,
                'humanNumber': '28',
                'direction': 'across',
                'position': {
                    'x': 0,
                    'y': 12
                },
                'separatorLocations': {},
                'length': 5,
                'clue': 'Little boring tease uttered brief comment (5)',
                'group': [
                    '28-across'
                ],
                'solution': 'TWEET',
                'format': '5'
            },
            {
                'id': '29-across',
                'number': 29,
                'humanNumber': '29',
                'direction': 'across',
                'position': {
                    'x': 6,
                    'y': 12
                },
                'separatorLocations': {},
                'length': 9,
                'clue': 'French statesman wants fatty pork pie in Brussels (9)',
                'group': [
                    '29-across'
                ],
                'solution': 'RICHELIEU',
                'format': '9'
            },
            {
                'id': '30-across',
                'number': 30,
                'humanNumber': '30',
                'direction': 'across',
                'position': {
                    'x': 0,
                    'y': 14
                },
                'separatorLocations': {},
                'length': 15,
                'clue': 'Looked after poorly old lady nursed by boy (15)',
                'group': [
                    '30-across'
                ],
                'solution': 'MALADMINISTERED',
                'format': '15'
            },
            {
                'id': '1-down',
                'number': 1,
                'humanNumber': '1',
                'direction': 'down',
                'position': {
                    'x': 0,
                    'y': 0
                },
                'separatorLocations': {
                    ',': [
                        9
                    ]
                },
                'length': 15,
                'clue': 'Windows conceivably get panes misty or foggy (9,6)',
                'group': [
                    '1-down'
                ],
                'solution': 'OPERATINGSYSTEM',
                'format': '9,6'
            },
            {
                'id': '2-down',
                'number': 2,
                'humanNumber': '2',
                'direction': 'down',
                'position': {
                    'x': 2,
                    'y': 0
                },
                'separatorLocations': {},
                'length': 5,
                'clue': 'Eat at party, turning up before hosts (5)',
                'group': [
                    '2-down'
                ],
                'solution': 'ERODE',
                'format': '5'
            },
            {
                'id': '3-down',
                'number': 3,
                'humanNumber': '3',
                'direction': 'down',
                'position': {
                    'x': 4,
                    'y': 0
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Making sound adjustment to very old decoration (7)',
                'group': [
                    '3-down'
                ],
                'solution': 'VOICING',
                'format': '7'
            },
            {
                'id': '4-down',
                'number': 4,
                'humanNumber': '4',
                'direction': 'down',
                'position': {
                    'x': 6,
                    'y': 0
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Queen stopping King Edward\'s upcoming retirement (7)',
                'group': [
                    '4-down'
                ],
                'solution': 'RETREAT',
                'format': '7'
            },
            {
                'id': '5-down',
                'number': 5,
                'humanNumber': '5',
                'direction': 'down',
                'position': {
                    'x': 8,
                    'y': 0
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Ambassador and clerk pounded knocker (7)',
                'group': [
                    '5-down'
                ],
                'solution': 'HECKLER',
                'format': '7'
            },
            {
                'id': '6-down',
                'number': 6,
                'humanNumber': '6',
                'direction': 'down',
                'position': {
                    'x': 10,
                    'y': 0
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Medicine one dispensed with odd type of disease (7)',
                'group': [
                    '6-down'
                ],
                'solution': 'ENDEMIC',
                'format': '7'
            },
            {
                'id': '7-down',
                'number': 7,
                'humanNumber': '7',
                'direction': 'down',
                'position': {
                    'x': 12,
                    'y': 0
                },
                'separatorLocations': {},
                'length': 9,
                'clue': 'With wind around, camper is to get going (9)',
                'group': [
                    '7-down'
                ],
                'solution': 'GALVANISE',
                'format': '9'
            },
            {
                'id': '8-down',
                'number': 8,
                'humanNumber': '8',
                'direction': 'down',
                'position': {
                    'x': 14,
                    'y': 0
                },
                'separatorLocations': {
                    ',': [
                        4,
                        6,
                        9
                    ]
                },
                'length': 15,
                'clue': 'Dash to hen night with drinks hard to find (4,2,3,6)',
                'group': [
                    '8-down'
                ],
                'solution': 'THINONTHEGROUND',
                'format': '4,2,3,6'
            },
            {
                'id': '15-down',
                'number': 15,
                'humanNumber': '15',
                'direction': 'down',
                'position': {
                    'x': 2,
                    'y': 6
                },
                'separatorLocations': {
                    ',': [
                        5
                    ]
                },
                'length': 9,
                'clue': 'Current producer of coral involved in retail (5,4)',
                'group': [
                    '15-down'
                ],
                'solution': 'SOLARCELL',
                'format': '5,4'
            },
            {
                'id': '16-down',
                'number': 16,
                'humanNumber': '16',
                'direction': 'down',
                'position': {
                    'x': 5,
                    'y': 6
                },
                'separatorLocations': {},
                'length': 3,
                'clue': 'Knight Rider\'s barge? (3)',
                'group': [
                    '16-down'
                ],
                'solution': 'HOY',
                'format': '3'
            },
            {
                'id': '18-down',
                'number': 18,
                'humanNumber': '18',
                'direction': 'down',
                'position': {
                    'x': 9,
                    'y': 6
                },
                'separatorLocations': {},
                'length': 3,
                'clue': 'Where to get milk jug that\'s bottomless (3)',
                'group': [
                    '18-down'
                ],
                'solution': 'EWE',
                'format': '3'
            },
            {
                'id': '20-down',
                'number': 20,
                'humanNumber': '20',
                'direction': 'down',
                'position': {
                    'x': 4,
                    'y': 8
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Claimed previous lover faked it (7)',
                'group': [
                    '20-down'
                ],
                'solution': 'EXACTED',
                'format': '7'
            },
            {
                'id': '21-down',
                'number': 21,
                'humanNumber': '21',
                'direction': 'down',
                'position': {
                    'x': 6,
                    'y': 8
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'One with a strong spirit like revolutionary warrior (7)',
                'group': [
                    '21-down'
                ],
                'solution': 'SAMURAI',
                'format': '7'
            },
            {
                'id': '22-down',
                'number': 22,
                'humanNumber': '22',
                'direction': 'down',
                'position': {
                    'x': 8,
                    'y': 8
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'German barman stuffing hot starters for Indians in grill (7)',
                'group': [
                    '22-down'
                ],
                'solution': 'HIBACHI',
                'format': '7'
            },
            {
                'id': '23-down',
                'number': 23,
                'humanNumber': '23',
                'direction': 'down',
                'position': {
                    'x': 10,
                    'y': 8
                },
                'separatorLocations': {},
                'length': 7,
                'clue': 'Art desiring to be the greatest? (7)',
                'group': [
                    '23-down'
                ],
                'solution': 'LONGEST',
                'format': '7'
            },
            {
                'id': '27-down',
                'number': 27,
                'humanNumber': '27',
                'direction': 'down',
                'position': {
                    'x': 12,
                    'y': 10
                },
                'separatorLocations': {},
                'length': 5,
                'clue': 'What makes basket more comfortable is losing its lid (5)',
                'group': [
                    '27-down'
                ],
                'solution': 'OSIER',
                'format': '5'
            }
        ],
        'solutionAvailable': true,
        'hasNumbers': true,
        'randomCluesOrdering': false,
        'creator': {
            'name': 'Picaroon',
            'webUrl': 'http://www.theguardian.com/profile/picaroon'
        },
        'pdf': 'https://crosswords-static.guim.co.uk/gdn.cryptic.20161110.pdf',
        'dateSolutionAvailable': '2016-11-10T00:00:00Z'
    };

    describe('Crosswords', function () {

        var injector = new Injector();
        var renderedComponent;

        beforeEach(function (done) {
            injector.mock('common/views/svgs', {
                inlineSvg: function() {
                    return '';
                }
            });
            injector.require([
                'react/addons',
                'common/modules/crosswords/crossword'
            ], function(React, Crossword) {
                var ReactTestUtils = React.addons.TestUtils;
                var component = React.createElement(Crossword, {
                    data: CROSSWORD_MOCK_DATA
                });

                renderedComponent = ReactTestUtils.renderIntoDocument(component);
                renderedComponent.save = function(){};

                done();
            });
        });

        it('Can move focus with direction keys', function () {

            // focus on 0, 0

            renderedComponent.focusClue(0, 0, 'across');

            // press the left key (should do nothing)

            renderedComponent.onKeyDown(
                {keyCode: 37, shiftKey: false, metaKey: false, ctrlKey: false, altKey: false, preventDefault: function(){} }
            );

            expect(renderedComponent.state.cellInFocus.x).toBe(0);
            expect(renderedComponent.state.cellInFocus.y).toBe(0);

            // press the right key (moves us right)

            renderedComponent.onKeyDown(
                {keyCode: 39, shiftKey: false, metaKey: false, ctrlKey: false, altKey: false, preventDefault: function(){} }
            );

            expect(renderedComponent.state.cellInFocus.x).toBe(1);
            expect(renderedComponent.state.cellInFocus.y).toBe(0);

        });

        it('Moves focus when inserting a charater', function() {

            // focus on 0, 0

            renderedComponent.focusClue(0, 0, 'across');

            // insert a character (this should move our focus right again)

            renderedComponent.insertCharacter('A');

            expect(renderedComponent.state.cellInFocus.x).toBe(1);
            expect(renderedComponent.state.cellInFocus.y).toBe(0);

        });

        it('Can move focus with tab keys', function () {

            renderedComponent.focusClue(0, 0, 'across');

            renderedComponent.onKeyDown(
                {keyCode: 9, shiftKey: false, metaKey: false, ctrlKey: false, altKey: false, preventDefault: function(){} }
            );

            expect(renderedComponent.state.cellInFocus.x).toBe(0);
            expect(renderedComponent.state.cellInFocus.y).toBe(2);


        });

        it('Can move focus with shift+tab keys', function () {

            renderedComponent.focusClue(0, 2, 'across');

            renderedComponent.onKeyDown(
                {keyCode: 9, shiftKey: true, metaKey: false, ctrlKey: false, altKey: false, preventDefault: function(){} }
            );

            expect(renderedComponent.state.cellInFocus.x).toBe(0);
            expect(renderedComponent.state.cellInFocus.y).toBe(0);

        });

        it('Can backspace out inserted text', function () {

            // focus on 0, 0 and insert a character there

            renderedComponent.focusClue(0, 0, 'across');
            renderedComponent.insertCharacter('A');
            expect(renderedComponent.getCellValue(0, 0)).toBe('A');
            expect(renderedComponent.cellIsEmpty(0, 0)).toBe(false);

            // move us back to the starting position where we added the character

            renderedComponent.focusClue(0, 0, 'across');

            // press the backspace key

            renderedComponent.onKeyDown(
                {keyCode: 8, shiftKey: false, metaKey: false, ctrlKey: false, altKey: false, preventDefault: function(){} }
            );

            expect(renderedComponent.getCellValue(0, 0)).toBe('');

        });

        it('Can backspace to move around', function () {

            renderedComponent.focusClue(1, 0, 'across');
            expect(renderedComponent.getCellValue(1, 0)).toBe('');

            renderedComponent.onKeyDown(
                {keyCode: 8, shiftKey: false, metaKey: false, ctrlKey: false, altKey: false, preventDefault: function(){} }
            );

            expect(renderedComponent.state.cellInFocus.x).toBe(0);
            expect(renderedComponent.state.cellInFocus.y).toBe(0);

        });


        it('Can clear single rows', function () {

            renderedComponent.focusClue(0, 0, 'across');
            renderedComponent.insertCharacter('A');

            expect(renderedComponent.getCellValue(0, 0)).toBe('A');

            renderedComponent.onClearSingle();

            expect(renderedComponent.getCellValue(0, 0)).toBe('');

        });

        it('Can clear all', function () {

            renderedComponent.focusClue(0, 0, 'across');
            renderedComponent.insertCharacter('A');

            expect(renderedComponent.getCellValue(0, 0)).toBe('A');

            renderedComponent.onClearAll();

            expect(renderedComponent.getCellValue(0, 0)).toBe('');

        });

        it('Can clear wrong cells on Check row', function () {

            renderedComponent.focusClue(0, 0, 'across');
            renderedComponent.insertCharacter('O');
            renderedComponent.focusClue(1, 0, 'across');
            renderedComponent.insertCharacter('T');

            renderedComponent.onCheck();

            expect(renderedComponent.getCellValue(0, 0)).toBe('O');
            expect(renderedComponent.getCellValue(1, 0)).toBe('');

        });

        it('Can clear wrong cells on Check all', function () {

            renderedComponent.focusClue(0, 0, 'across');
            renderedComponent.insertCharacter('O');
            renderedComponent.focusClue(1, 0, 'across');
            renderedComponent.insertCharacter('T');

            renderedComponent.onCheckAll();

            expect(renderedComponent.getCellValue(0, 0)).toBe('O');
            expect(renderedComponent.getCellValue(1, 0)).toBe('');

        });

        it('Can select cells', function() {

            renderedComponent.onSelect(0, 0);

            expect(renderedComponent.state.cellInFocus.x).toBe(0);
            expect(renderedComponent.state.cellInFocus.y).toBe(0);
            expect(renderedComponent.state.directionOfEntry).toBe('across');

            renderedComponent.onSelect(0, 0);

            expect(renderedComponent.state.directionOfEntry).toBe('down');

        });

        it('can select cells on mobile', function() {

            renderedComponent.state.cellInFocus = {x: 0, y: 0};

            renderedComponent.onClickHiddenInput(
                { preventDefault: function(){}, type: 'touchstart' }
            );

            expect(renderedComponent.state.cellInFocus.x).toBe(0);
            expect(renderedComponent.state.cellInFocus.y).toBe(0);
            expect(renderedComponent.state.directionOfEntry).toBe('across');

            renderedComponent.onClickHiddenInput(
                { preventDefault: function(){}, type: 'touchstart' }
            );

            expect(renderedComponent.state.directionOfEntry).toBe('down');

        });

        it('Can reveal (cheat) clues', function() {

            renderedComponent.focusClue(0, 0, 'across');
            renderedComponent.onCheat();

            expect(renderedComponent.getCellValue(0, 0)).toBe('O');
            expect(renderedComponent.getCellValue(1, 0)).toBe('N');
            expect(renderedComponent.getCellValue(2, 0)).toBe('E');

        });

        it('Can reveal (cheat) ALL clues', function() {

            renderedComponent.focusClue(0, 0, 'across');
            renderedComponent.onSolution();

            expect(renderedComponent.getCellValue(0, 0)).toBe('O');
            expect(renderedComponent.getCellValue(1, 0)).toBe('N');
            expect(renderedComponent.getCellValue(2, 0)).toBe('E');

        });

    });

});
