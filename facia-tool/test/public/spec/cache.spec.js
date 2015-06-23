import * as cache from 'modules/cache';

describe('Cache', function () {
    it('stores until expiry', function () {
        var currentTime = 12;
        cache.overrides.Date = function () {};
        cache.overrides.Date.prototype.valueOf = function () {
            return currentTime;
        };

        var put = cache.put('fruit', 'banana', {
            color: 'yellow',
            sweet: true
        });
        expect(put).toEqual({
            color: 'yellow',
            sweet: true
        });

        // Advance the time but keep it below the limit
        currentTime = 14;
        expect(cache.get('fruit', 'banana')).toEqual({
            color: 'yellow',
            sweet: true
        });

        // store in a different pot / key
        cache.put('fruit', 'apple', {
            color: 'red'
        });
        cache.put('food', 'banana', {
            color: 'green'
        });
        expect(cache.get('fruit', 'banana')).toEqual({
            color: 'yellow',
            sweet: true
        });
        expect(cache.get('fruit', 'apple')).toEqual({
            color: 'red'
        });
        expect(cache.get('food', 'banana')).toEqual({
            color: 'green'
        });

        // check the expiry
        currentTime = 1212121212;
        expect(cache.get('food', 'banana')).toBeUndefined();
    });

    it('returns undefined on error', function () {
        expect(cache.get()).toBeUndefined();
        expect(cache.get('one')).toBeUndefined();
        expect(cache.get('one', 'two')).toBeUndefined();
        expect(cache.put()).toBeUndefined();
        expect(cache.put('one')).toBeUndefined();
    });
});
