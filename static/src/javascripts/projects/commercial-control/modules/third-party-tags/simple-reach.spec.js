// @flow
import { simpleReach } from './simple-reach';

const { shouldRun, url } = simpleReach;

jest.mock('lib/config', () => ({
    switches: {
        simpleReach: true,
    },
    page: {
        headline: 'Starship Enterprise',
        author: 'Captain Kirk',
        sectionName: 'Space Exploration',
        keywords: 'Space,Travel',
        webPublicationDate: 1498113262000,
        isFront: false,
        isPaidContent: true,
        pageId: 100,
    },
}));

describe('third party tag SimpleReach', () => {
    it('should exist', () => {
        expect(shouldRun).toBe(true);
        expect(url).toBe('//d8rk54i4mohrb.cloudfront.net/js/reach.js');
    });

    it('should set a global config', () => {
        // SimpleReach demands a dangling underscore in the global config
        // eslint-disable-next-line no-underscore-dangle
        const reachConfig = window.__reach_config;
        const expectedConfig = {
            pid: '58ff7f3a736b795c10004930',
            title: 'Starship Enterprise',
            date: new Date(1498113262000),
            authors: ['Captain Kirk'],
            channels: ['Space Exploration'],
            tags: ['Space', 'Travel'],
            article_id: 100,
            ignore_errors: false,
        };
        expect(reachConfig).toEqual(expectedConfig);
    });
});
