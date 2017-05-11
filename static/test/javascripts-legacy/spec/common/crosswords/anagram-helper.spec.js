define([
    'lodash/collections/sortBy',
    'helpers/injector'
], function (
    sortBy,
    Injector
) {
    var cases = [{
        entries: ['', '', '', '', 'l', '', 'e'],
        word: 'liberal',
        expected: [{ value: 'l', entered: true }, { value: 'i', entered: false }, { value: 'b', entered: false }, { value: 'e', entered: true }, { value: 'r', entered: false }, { value: 'a', entered: false }, { value: 'l', entered: false }]
    },

    // when there's an incorrect entry we should still highlight the correct ones
    {
        entries: ['s', '', '', '', 'h', '', '', '', '', '', '', ''],
        word: 'atennistutor',
        expected: [{ value: 'a', entered: false }, { value: 't', entered: false }, { value: 'e', entered: false }, { value: 'n', entered: false }, { value: 'n', entered: false }, { value: 'i', entered: false }, { value: 's', entered: true }, { value: 't', entered: false }, { value: 'u', entered: false }, { value: 't', entered: false }, { value: 'o', entered: false }, { value: 'r', entered: false }]
    }];

    describe('Anagram Helper', function () {
        var injector = new Injector();
        var AnagramHelper;

        beforeEach(function(done) {
            injector.mock('common/views/svgs', {
                inlineSvg: function() {
                    return '';
                }
            });
            injector.require(['common/modules/crosswords/anagram-helper/main'], function(AnagramHelperModule) {
                AnagramHelper = AnagramHelperModule;
                done();
            });
        });
        it('marks the correct letters as entered', function () {
            var sort = function sort(x) {
                return x.value + x.entered.toString();
            };

            cases.forEach(function (testCase) {
                var helper = new AnagramHelper();
                var entries = testCase.entries.map(function (e) {
                    return { value: e };
                });
                var result = helper.shuffleWord(testCase.word, entries);

                expect(sortBy(result, sort)).toEqual(sortBy(testCase.expected, sort));
            });
        });
    });
});
