define(['common/modules/article/spacefinder'], function (
    spacefinder
) {
    describe('spacefinder', function () {

        it('should test elements correctly', function () {

            var para = {top: 200, bottom: 300},
                rules = {minAbove: 50, minBelow: 300},
                others = [
                    {top: 0, bottom: 100, expectedResult: true}, // fine
                    {top: 600, bottom: 700, expectedResult: true}, // fine
                    {top: 0, bottom: 151, expectedResult: false}, // too close to top (49 < 50)
                    {top: 400, bottom: 500, expectedResult: false}, // too close to bottom (200 < 300)
                    {top: 210, bottom: 290, expectedResult: false}, // overlapping
                    {top: 0, bottom: 600, expectedResult: false}, // overlapping
                    {top: 100, bottom: 250, expectedResult: false} // overlapping
                ];

            // jscs:disable disallowDanglingUnderscores
            for (var i = 0; i < others.length; i++) {
                expect(spacefinder._testElem(rules, para, others[i])).toBe(others[i].expectedResult);
            }

            expect(spacefinder._testElems(rules, para, others)).toBe(false);
            expect(spacefinder._testElems(rules, para, others.slice(0, 2))).toBe(true);
            // jscs:enable disallowDanglingUnderscores

        });
    });
});
