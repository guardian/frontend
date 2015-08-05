import cleanClone from 'utils/clean-clone';
import cloneKey from 'utils/clone-with-key';
import deepGet from 'utils/deep-get';

describe('utils/clean-code', function () {
    it('clones objects', function () {
        var obj = {
            one: 1
        };
        expect(cleanClone(obj)).toEqual(obj);
        expect(cleanClone(obj)).not.toBe(obj);
        expect(cleanClone()).toBeUndefined();
    });
});

describe('utils/clone-with-key', function () {
    it('clones and adds a key', function () {
        expect(cloneKey({
            one: 1
        }, 'numbers')).toEqual({
            one: 1,
            id: 'numbers'
        });
    });
});

describe('utils/deep-get', function () {
    it('gets from a deep object', function () {
        var obj = {
            a: {
                b: {
                    c: {
                        d: 1
                    }
                }
            },
            one: {
                two: 2
            }
        };

        expect(deepGet(obj, 'a.b.c..d')).toBe(1);
        expect(deepGet(obj, 'one')).toEqual({
            two: 2
        });
        expect(deepGet(obj, 'c.d')).toBeUndefined();
        expect(deepGet(obj, ['a', 'b', 'c', 'd'])).toBe(1);
        expect(deepGet({
            shallow: true
        })).toEqual({
            shallow: true
        });
    });
});
