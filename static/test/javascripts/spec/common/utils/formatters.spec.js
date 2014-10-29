define(['common/utils/formatters'], function (formatters) {

    describe("integerCommas", function () {

        it("should correctly add a comma for >=4 digit numbers", function () {

            var tests = [
                [1,      '1'],
                [12,     '12'],
                [123,    '123'],
                [1234,   '1,234'],
                [12345,  '12,345'],
                ['1',    '1'],
                ['12',   '12'],
                ['123',  '123'],
                ['1234', '1,234'],
                ['12345','12,345']
            ];
            for (var i = 0; i < tests.length; i++) {
                expect(formatters.integerCommas(tests[i][0])).toBe(tests[i][1]);
            }
        });

    });

});
