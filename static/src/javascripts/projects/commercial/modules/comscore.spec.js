// @flow
import config from 'lib/config';
import { loadScript } from 'lib/load-script';
import { init, _ } from './comscore';

jest.mock('lib/load-script', () => ({
    loadScript: jest.fn(() => Promise.resolve()),
}));

const getComscoreScripTags = (): NodeList<HTMLElement> =>
    document.querySelectorAll('script#comscore');

describe('comscore init', () => {
    beforeEach(() => {
        config.set('switches.comscore', true);
    });

    it('should do nothing if the comscore switch is off', () => {
        config.set('switches.comscore', false);
        init();

        const comscoreTags = getComscoreScripTags();
        expect(comscoreTags.length).toBe(0);
    });

    it('should call loadScript with the correctly parameters', () => {
        init();

        expect(loadScript).toBeCalledWith(_.comscoreSrc, {
            id: 'comscore',
            async: true,
        });
    });
});

describe('comscore getGlobals', () => {
    it('return an object with the c1 and c2 properties correctly set when called with "Network Front" as keywords', () => {
        const expectedGlobals = { c1: _.comscoreC1, c2: _.comscoreC2 };
        expect(_.getGlobals('Network Front')).toMatchObject(expectedGlobals);
    });

    it('return an object with the c1 and c2 properties correctly set when called with non-"Network Front" as keywords', () => {
        const expectedGlobals = { c1: _.comscoreC1, c2: _.comscoreC2 };
        expect(_.getGlobals('')).toMatchObject(expectedGlobals);
    });

    it('returns an object with no comscorekw variable set when called with "Network Front" as keywords', () => {
        const comscoreGlobals = Object.keys(_.getGlobals('Network Front'));
        expect(comscoreGlobals).not.toContain('comscorekw');
    });

    it('returns an object with the correct comscorekw variable set', () => {
        const keywords = 'These are the best keywords The greatest!';

        expect(_.getGlobals('')).toMatchObject({ comscorekw: '' });
        expect(_.getGlobals(keywords)).toMatchObject({
            comscorekw: keywords,
        });
    });
});
