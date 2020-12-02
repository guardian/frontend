// @flow

import config from 'lib/config';

import { OnwardContent } from './onward-content';

jest.mock('ophan/ng', () => ({
    record: jest.fn(),
}));

jest.mock('lib/config');

const getShortUrl = (): string =>
    encodeURIComponent(config.get('page.shortUrl'));

describe('Onward Content', () => {
    beforeEach(() => {
        config.page = {
            shortUrl: 'http://theguardian.com/p/42zeg',
            blogIds: 'global-development/poverty-matters',
            seriesId: 'global-development/series/modern-day-slavery-in-focus',
        };

        if (document.body) {
            document.body.innerHTML = `
                <div class="js-onward"></div>
            `;
        }
    });

    test('should use blog tag if first', () => {
        config.page.nonKeywordTagIds = [
            ['global-development', 'poverty-matters'].join('/'),

            [
                'global-development',
                'series',
                'modern-day-slavery-in-focus',
            ].join('/'),
        ].join(',');

        const el = document.querySelector('.js-onward');

        if (el) {
            // eslint-disable-next-line no-new
            const onward = new OnwardContent(el);

            expect(onward.endpoint).toBe(
                `/series/global-development/poverty-matters.json?shortUrl=${getShortUrl()}`
            );
        }
    });

    test('should use series tag if first', () => {
        config.page.nonKeywordTagIds = [
            [
                'global-development',
                'series',
                'modern-day-slavery-in-focus',
            ].join('/'),

            ['global-development', 'poverty-matters'].join('/'),
        ].join(',');

        const el = document.querySelector('.js-onward');

        if (el) {
            // eslint-disable-next-line no-new
            const onward = new OnwardContent(el);

            expect(onward.endpoint).toBe(
                `/series/global-development/series/modern-day-slavery-in-focus.json?shortUrl=${getShortUrl()}`
            );
        }
    });
});
