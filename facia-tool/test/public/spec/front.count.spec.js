import {CONST} from 'modules/vars';
import count from 'utils/front-count';

describe('utils/front-count', function () {
    var fronts = {
        'a': {},
        'b': {},
        'c': { priority: 'commercial' },
        'd': { priority: 'editorial' },
        'e': { priority: 'whatever' },
        'f': { priority: 'whatever' }
    };

    it('counts fronts without priority', function () {
        var result = count(fronts, 'editorial');
        expect(result).toEqual({
            count: 3,
            max: CONST.maxFronts.editorial
        });
    });

    it('defaults to editorial priority', function () {
        var result = count(fronts);
        expect(result).toEqual({
            count: 3,
            max: CONST.maxFronts.editorial
        });
    });

    it('counts fronts with any priority', function () {
        var result = count(fronts, 'commercial');
        expect(result).toEqual({
            count: 1,
            max: CONST.maxFronts.commercial
        });
    });

    it('counts fronts with no limits', function () {
        var result = count(fronts, 'whatever');
        expect(result).toEqual({
            count: 2,
            max: Infinity
        });
    });
});
