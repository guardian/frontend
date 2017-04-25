// @flow
/* eslint-disable guardian-frontend/global-config */

Object.assign(window.guardian.config, {
    page: {
        tones: 'foo',
        series: 'bar',
        references: [{ baz: 'one' }, { baz: 'two' }],
        webPublicationDate: '2013-03-20T17:07:00.000Z',
        pageId: 'politics/2017/mar/14/ukip-donor-arron-banks-says-he-has-quit-party-to-set-up-ukip-20',
    },
});

// We need to hoist setting the window.guardian.config to code under test above import
// (but can't do it with the jest mocks that get auto-hoisted)
// eslint-disable-next-line import/first
import config from './config';

describe('Config', () => {
    it('should have "hasTone" property', () => {
        expect(config.hasTone('foo')).toBeTruthy();
        expect(config.hasTone('foo-bad')).toBeFalsy();
    });

    it('should have "hasSeries" property', () => {
        expect(config.hasSeries('bar')).toBeTruthy();
        expect(config.hasSeries('bar-bad')).toBeFalsy();
    });

    it('should have "referencesOfType" property', () => {
        expect(config.referencesOfType('baz')).toEqual(['one', 'two']);
        expect(config.referencesOfType('bar-bad')).toEqual([]);
    });

    it('should have "referenceOfType" property', () => {
        expect(config.referenceOfType('baz')).toEqual('one');
        expect(config.referenceOfType('bar-bad')).toBeUndefined();
    });

    it('should have "webPublicationDateAsUrlPart" property', () => {
        expect(config.webPublicationDateAsUrlPart()).toBe('2013/03/20');
    });

    it('should return the expected dateFromSlug', () => {
        expect(config.dateFromSlug()).toBe('2017/mar/14');
    });
});
