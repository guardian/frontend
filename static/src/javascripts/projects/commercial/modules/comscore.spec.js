// @flow
import config from 'lib/config';
import { init, _ } from './comscore';

const getComscoreScripTags = (): NodeList<HTMLElement> =>
    document.querySelectorAll('script#comscore');

const isValidComscoreScriptTag = (tag: HTMLElement) =>
    tag instanceof HTMLScriptElement &&
    tag.src === _.comscoreSrc &&
    tag.async === true;

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

    it('should drop the corect script tag if the comscore switch is on', () => {
        config.set('switches.comscore', true);
        init();

        const comscoreTags = getComscoreScripTags();
        expect(comscoreTags.length).toBe(1);
        expect(isValidComscoreScriptTag(comscoreTags[0])).toBe(true);
    });
});

describe('comscore getGlobals', () => {
    it('returns an object with the correct comscorekw variable set', () => {
        const randomStr = Math.random()
            .toString(36)
            .substring(2);

        expect(_.getGlobals('')).toMatchObject({ comscorekw: '' });
        expect(_.getGlobals(randomStr)).toMatchObject({
            comscorekw: randomStr,
        });
    });

    it('returns an object with no comscorekw variable set when called with "Network Front" as keywords', () => {
        expect(_.getGlobals('Network Front')).toEqual(
            // $FlowFixMe property not does actually exist
            expect.not.objectContaining({ comscorekw: expect.any(Object) })
        );
    });

    it('always return an object with the c1 and c2 variables', () => {
        const expectedGlobals = { c1: _.comscoreC1, c2: _.comscoreC2 };

        expect(_.getGlobals('')).toMatchObject(expectedGlobals);
        expect(_.getGlobals('Network Front')).toMatchObject(expectedGlobals);
    });
});
