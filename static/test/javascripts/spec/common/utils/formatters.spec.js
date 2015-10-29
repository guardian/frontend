define(['common/utils/formatters'], function (formatters) {
    describe('integerCommas', function () {

        it('should correctly add a comma for >=4 digit numbers', function () {

            var tests = [
                [1, '1'],
                [12, '12'],
                [123, '123'],
                [1234, '1,234'],
                [12345, '12,345'],
                [123456, '123,456'],
                [1234567, '1,234,567'],
                [12345678, '12,345,678'],
                [123456789, '123,456,789'],
                [1234567890, '1,234,567,890']
            ];
            for (var i = 0; i < tests.length; i++) {
                expect(formatters.integerCommas(tests[i][0])).toBe(tests[i][1]);
                expect(formatters.integerCommas(tests[i][0]).toString()).toBe(tests[i][1]);
            }
        });

    });
});
