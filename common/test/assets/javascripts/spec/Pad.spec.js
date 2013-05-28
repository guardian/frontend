define(['modules/pad'], function(pad) {

    describe("Pad", function() {
        
        describe("should add leading zeroes", function() {
        
            [[1, 1, '1'], [1, 2, '01'], [12, 1, '12']].forEach(function(dataProvider) {
                var number = dataProvider[0],
                    length = dataProvider[1],
                    expected = dataProvider[2];
                it('number: ' + number +', length: ' + length + ', expected: ' + expected, function() {
                    expect(pad(number, length)).toBe(expected);
                });
            });
        
        })

    });

});