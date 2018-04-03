// @flow

import sortBy from 'lodash/collections/sortBy';

import { AnagramHelper } from './main';

jest.mock('react', () => ({
    Component: function Component() {},
}));

jest.mock('react-dom', () => ({
    findDOMNode: () => ({
        focus: () => {},
    }),
}));

const CASES = [
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
            { value: 'l', entered: false },
        ],
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
            { value: 'r', entered: false },
        ],
    },
];

describe('Anagram Helper', () => {
    test('marks the correct letters as entered', () => {
        const sort = x => x.value + x.entered.toString();

        CASES.forEach(testCase => {
            const entries = testCase.entries.map(e => ({ value: e }));
            const result = new AnagramHelper().shuffleWord(
                testCase.word,
                entries
            );

            expect(sortBy(result, sort)).toEqual(
                sortBy(testCase.expected, sort)
            );
        });
    });
});
