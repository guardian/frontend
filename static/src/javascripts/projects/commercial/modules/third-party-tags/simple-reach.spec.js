// @flow
import { simpleReach } from './simple-reach';

const { shouldRun, url } = simpleReach;

/**
 * we have to mock config like this because
 * loading simple-reach has side affects
 * that are dependent on config.
 * */

jest.mock('lib/config', () => {
    const defaultConfig = {
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
    };

    return Object.assign({}, defaultConfig, {
        get: (path: string = '', defaultValue: any) =>
            path
                .replace(/\[(.+?)\]/g, '.$1')
                .split('.')
                .reduce((o, key) => o[key], defaultConfig) || defaultValue,
    });
});

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
