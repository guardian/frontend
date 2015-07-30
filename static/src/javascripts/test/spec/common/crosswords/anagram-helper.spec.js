import _ from 'common/utils/_';
import Shuffler from 'es6/projects/common/modules/crosswords/anagram-helper/shuffler';

describe('Anagram Helper', function () {
    let shuffler;

    beforeEach(function () {
        const entriesFixture = ['', '', '', '', 'l', '', 'e'].map(letter => {
            return { value: letter };
        });

        shuffler = new Shuffler({
            entries: entriesFixture,
            word: 'liberal'.split('')
        });
    });

    it('marks the correct letters as entered', function () {
        const result = shuffler.getLetters();
        const expected = [
            { value: 'l', entered: true },
            { value: 'i', entered: false },
            { value: 'b', entered: false },
            { value: 'e', entered: true },
            { value: 'r', entered: false },
            { value: 'a', entered: false },
            { value: 'l', entered: false }
        ];

        const sort = x => x.value + x.entered.toString();

        expect(_.sortBy(result, sort)).toEqual(_.sortBy(expected, sort));
    });
});
