define([ 'common/modules/article/spacefinder',
], function(
    spacefinder
    ) {

    describe("spacefinder", function() {

        it("should calculate the right spaces", function() {
            var elems = [
                {top: 10, bottom: 25},
                {top: 42, bottom: 50},
                {top: 55, bottom: 60},
                {top: 59, bottom: 62}, // overlapping
                {top: 70, bottom: 85}
            ];

            var spaces = spacefinder._elemsToSpaces(elems, 100);
            var expectedSpaces = [
                {top: 0, bottom: 10, height: 10},
                {top: 25, bottom: 42, height: 17},
                {top: 50, bottom: 55, height: 5},
                {top: 62, bottom: 70, height: 8},
                {top: 85, bottom: 100, height: 15},
            ];

            expect(spaces.length).toBe(expectedSpaces.length);
            for(var i=0; i < spaces.length; i++) {
                expect(spaces[i].top).toBe(expectedSpaces[i].top);
                expect(spaces[i].bottom).toBe(expectedSpaces[i].bottom);
                expect(spaces[i].height).toBe(expectedSpaces[i].height);
            }
        });

        it("should handle bodies without non-paragraph elements", function(){
            var spaces = spacefinder._elemsToSpaces([], 100);
            expect(spaces.length).toBe(1);
            expect(spaces[0].top).toBe(0);
            expect(spaces[0].bottom).toBe(100);
            expect(spaces[0].height).toBe(100);
        });

        it("should find the right paragraphs for given spaces", function() {
            var spaces = [
                    {top: 0, bottom: 150, height: 150},
                    {top: 200, bottom: 280, height: 80},
                    {top: 350, bottom: 500, height: 150}
                ],
                elems = [
                    {top: 0, bottom: 45, element: 'a'}, // too high (top < minTop)
                    {top: 45, bottom: 55, element: 'b'}, // viable space
                    {top: 55, bottom: 150, element: 'c'}, // too small (distance from top to next space <100)
                    {top: 150, bottom: 200, element: 'd'}, // not viable (doesn't lie in space)
                    {top: 200, bottom: 280, element: 'e'}, // too small
                    {top: 350, bottom: 360, element: 'f'}, // top padding too small (<15)
                    {top: 360, bottom: 380, element: 'g'}, // top padding too small (<15)
                    {top: 380, bottom: 400, element: 'h'}, // viable space
                    {top: 400, bottom: 500, element: 'i'} // viable space
                ],
                expectedParas = ['b', 'h', 'i'],
                paras = spacefinder._findViableParagraphs(elems, spaces, 100, 40, 15);

            expect(paras.length).toBe(expectedParas.length);
            for(var i=0; i < paras.length; i++) {
                expect(paras[i].element).toBe(expectedParas[i]);
            }

        });
    });
});
