// @flow

import config from './config';

jest.mock('lib/pad', () => jest.fn(arg => arg));

const mockConfig = Object.assign(config, {
    page: {
        tones: 'foo',
        series: 'bar',
        references: [{ baz: 'one' }, { baz: 'two' }],
        webPublicationDate: '2013-12-20T17:07:00.000Z',
        pageId: 'politics/2017/mar/14/ukip-donor-arron-banks-says-he-has-quit-party-to-set-up-ukip-20',
    },
});

describe('Config', () => {
    it('should have "hasTone" property', () => {
        expect(mockConfig.hasTone('foo')).toBeTruthy();
        expect(mockConfig.hasTone('foo-bad')).toBeFalsy();
    });

    it('should have "hasSeries" property', () => {
        expect(mockConfig.hasSeries('bar')).toBeTruthy();
        expect(mockConfig.hasSeries('bar-bad')).toBeFalsy();
    });

    it('should have "referencesOfType" property', () => {
        expect(mockConfig.referencesOfType('baz')).toEqual(['one', 'two']);
        expect(mockConfig.referencesOfType('bar-bad')).toEqual([]);
    });

    it('should have "referenceOfType" property', () => {
        expect(mockConfig.referenceOfType('baz')).toEqual('one');
        expect(mockConfig.referenceOfType('bar-bad')).toBeUndefined();
    });

    it('should have "webPublicationDateAsUrlPart" property', () => {
        expect(mockConfig.webPublicationDateAsUrlPart()).toBe('2013/12/20');
    });

    it('should return the expected dateFromSlug', () => {
        expect(mockConfig.dateFromSlug()).toBe('2017/mar/14');
    });
});
