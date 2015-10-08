import _ from 'common/utils/_';
import AnagramHelper from 'es6/projects/common/modules/crosswords/anagram-helper/main';

const cases = [
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

describe('Anagram Helper', function () {
    it('marks the correct letters as entered', function () {
        const sort = x => x.value + x.entered.toString();

        cases.forEach(testCase => {
            const helper = new AnagramHelper();
            const entries = testCase.entries.map(e => { return { value: e }; });
            const result = helper.shuffleWord(testCase.word, entries);

            expect(_.sortBy(result, sort)).toEqual(_.sortBy(testCase.expected, sort));
        });
    });
});
