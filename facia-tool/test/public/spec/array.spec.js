define([
    'utils/array'
], function (array) {
    describe('Array', function () {
        it('computes the difference of two lists', function () {
            var before = [
                {id: 1, sameAsBefore: true},
                {id: 2, sameAsBefore: true},
                {id: 3, sameAsBefore: true},
                {id: 4, sameAsBefore: true},
                {id: 5, sameAsBefore: true},
                {id: 6, sameAsBefore: true}
            ], after = [
                {id: 9},
                {id: 10},
                {id: 2},
                {id: 1},
                {id: 8},
                {id: 3},
                {id: 4},
                {id: 7}
            ],
            comparator = function (one, two) {
                return one.id === two.id;
            },
            generator = function (item) {
                return {
                    id: item.id,
                    generated: true
                };
            };

            var result = array.combine(after, before, comparator, generator);
            expect(result).toEqual([
                {id: 9, generated: true},
                {id: 10, generated: true},
                {id: 2, sameAsBefore: true},
                {id: 1, sameAsBefore: true},
                {id: 8, generated: true},
                {id: 3, sameAsBefore: true},
                {id: 4, sameAsBefore: true},
                {id: 7, generated: true}
            ]);
        });

        it('works even if first is an empty array', function () {
            var before = [], after = [
                {id: 1},
                {id: 2}
            ],
            comparator = function (one, two) {
                return one.id === two.id;
            },
            generator = function (item) {
                return {
                    id: item.id,
                    generated: true
                };
            };

            var result = array.combine(after, before, comparator, generator);
            expect(result).toEqual([
                {id: 1, generated: true},
                {id: 2, generated: true}
            ]);
        });

        it('works even if second is an empty array', function () {
            var before = [
                {id: 1},
                {id: 2}
            ], after = [],
            comparator = function (one, two) {
                return one.id === two.id;
            },
            generator = function (item) {
                return {
                    id: item.id,
                    generated: true
                };
            };

            var result = array.combine(after, before, comparator, generator);
            expect(result).toEqual([]);
        });
    });
});
