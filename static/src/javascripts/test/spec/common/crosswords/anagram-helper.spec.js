import _ from 'common/utils/_';
import Shuffler from 'es6/projects/common/modules/crosswords/anagram-helper/shuffler';

const fixtures = [
    {
        entries: ['', '', '', '', 'l', '', 'e'],
        word: 'liberal',
        expected: [
            { value: 'l', entered: true },
            { value: 'i', entered: false },
            { value: 'b', entered: false },
            { value: 'e', entered: true },
            { value: 'r', entered: false },
            { value: 'a', entered: false },
            { value: 'l', entered: false }
        ]
    },

    // when there's an incorrect entry we should still highlight the correct ones
    {
        entries: ['s', '', '', '', 'h', '', '', '', '', '', '', ''],
        word: 'atennistutor',
        expected: [
            { value: 'a', entered: false },
            { value: 't', entered: false },
            { value: 'e', entered: false },
            { value: 'n', entered: false },
            { value: 'n', entered: false },
            { value: 'i', entered: false },
            { value: 's', entered: true },
            { value: 't', entered: false },
            { value: 'u', entered: false },
            { value: 't', entered: false },
            { value: 'o', entered: false },
            { value: 'r', entered: false }
        ]
    }
];

fdescribe('Anagram Helper', function () {
    it('marks the correct letters as entered', function () {
        const cases = fixtures.map(fixture => {
            return {
                instance: new Shuffler({
                    entries: fixture.entries.map(letter => {
                        return { value: letter };
                    }),
                    word: fixture.word.split('')
                }),

                expected: fixture.expected
            };
        });

        const sort = x => x.value + x.entered.toString();

        cases.forEach(testCase => {
            const result = testCase.instance.getLetters();

            expect(_.sortBy(result, sort)).toEqual(_.sortBy(testCase.expected, sort));
        });
    });
});
