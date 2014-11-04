define([
    'bonzo',
    'lodash/collections/contains',
    'lodash/collections/every',
    'lodash/collections/map',
    'jasq'
], function (
    bonzo,
    contains,
    every,
    map
) {
    var fixture = [
        ["", "", "", "H", ""],
        ["", "", "", "I", ""],
        ["R", "", "", "", ""]
    ];

    function getLetters(cells) {
        return map(cells, function (cell) {
            return bonzo(cell).text();
        });
    }

    describe('Thumbnails', 'common/modules/crosswords/thumbnails', function () {
        describe('makeTextCells', function () {
            it('should only create as many cells as there are filled in', function (thumbs) {
                expect(thumbs.makeTextCells(fixture).length).toBe(3);
            });

            it('should create a cell for every letter that is filled in', function (thumbs) {
                var cells = thumbs.makeTextCells(fixture),
                    letters = getLetters(cells);
                
                expect(contains(letters, "H")).toBe(true);
                expect(contains(letters, "I")).toBe(true);
                expect(contains(letters, "R")).toBe(true);
            });

            it('should not create any empty text nodes', function (thumbs) {
                var cells = thumbs.makeTextCells(fixture),
                    letters = getLetters(cells);

                expect(contains(letters, "")).toBe(false);
                expect(contains(letters, null)).toBe(false);
            });

            it('should not create any nodes outside of the thumbnail borders', function (thumbs) {
                var gridWidth = fixture.length * (thumbs.cellSize + thumbs.borderSize) + thumbs.borderSize,
                    gridHeight = fixture[0].length * (thumbs.cellSize + thumbs.borderSize) + thumbs.borderSize,
                    cells = thumbs.makeTextCells(fixture);

                expect(every(cells, function (cell) {
                    var $cell = bonzo(cell),
                        x = $cell.attr('x'),
                        y = $cell.attr('y');

                    return x > 0 && x < gridWidth && y > 0 && y < gridHeight;
                })).toBe(true);
            });
        });
    });
});
