// @flow
import Chance from 'chance';
import {
    logHistory,
    logSummary,
    showInMegaNavEnable,
    getPopular,
    getContributors,
    isRevisit,
    reset,
    seriesSummary,
    mostViewedSeries,
    getArticleViewCountForDays,
    _,
    incrementDailyArticleCount,
    getMondayFromDate,
    getArticleViewCountForWeeks,
    incrementWeeklyArticleCount,
} from 'common/modules/onward/history';
import { local as localStorageStub } from 'lib/storage';

jest.mock('lib/storage', () => ({
    local: {
        get: jest.fn(),
        set: jest.fn(),
        isAvailable: jest.fn(),
        remove: jest.fn(),
    },
}));

jest.mock('lib/url', () => ({
    getPath: jest.fn(),
}));

jest.mock('fastdom');

jest.mock('lib/cookies', () => ({
    getCookie: jest.fn(),
}));

jest.mock('raven-js', () => ({
    config() {
        return this;
    },
    install() {
        return this;
    },
    captureException: jest.fn(),
}));

const contains = [['/p/3kvgc', 1], ['/p/3kx8f', 1], ['/p/3kx7e', 1]];

const today = Math.floor(Date.now() / 86400000); // 1 day in ms
const startOfThisWeek = getMondayFromDate(new Date());

const pageConfig = {
    pageId: '/p/3jbcb',

    section: 'foobar',
    sectionName: 'Foobar Section',

    keywordIds: 'foo/bar,baz/poo',
    keywords: 'Foobar Tag,Bazpoo Tag',

    seriesId: 'foo/series/bar',
    series: 'Foobar Series',

    authorIds: 'profile/finbarrsaunders,profile/rogermellie',
    author: 'Finbarr Saunders, Roger Mellie',
};

const oftenVisited = {
    pageId: '123',
    section: 'often/visited',
    sectionName: 'Often Visited Section',
};

const lessVisited = {
    pageId: '456',
    section: 'less/visited',
    sectionName: 'Less Visited Section',
};

describe('history', () => {
    let mockContains;
    let mockSummary;
    let mockDailyArticleCount;
    let mockWeeklyArticleCount;

    beforeEach(() => {
        mockContains = contains;

        localStorageStub.get.mockImplementation(key => {
            if (key === 'gu.history') {
                return mockContains;
            } else if (key === 'gu.history.summary') {
                return mockSummary;
            } else if (key === 'gu.history.dailyArticleCount') {
                return mockDailyArticleCount;
            } else if (key === 'gu.history.weeklyArticleCount') {
                return mockWeeklyArticleCount;
            }
        });

        localStorageStub.set.mockImplementation((key, data) => {
            if (key === 'gu.history') {
                mockContains = data;
            } else if (key === 'gu.history.summary') {
                mockSummary = data;
            } else if (key === 'gu.history.dailyArticleCount') {
                mockDailyArticleCount = data;
            } else if (key === 'gu.history.weeklyArticleCount') {
                mockWeeklyArticleCount = data;
            }
        });
    });

    afterEach(() => {
        reset();
        mockSummary = {};
    });

    it('should get history from local storage', () => {
        expect(_.getHistory()).toEqual(mockContains);
    });

    it('should set history to local storage', () => {
        logHistory(pageConfig);

        expect(_.getHistory()[0][0]).toEqual(pageConfig.pageId);
    });

    it('should set the count of entries', () => {
        logHistory(pageConfig);
        expect(_.getHistory()[0][1]).toEqual(1);

        logHistory(pageConfig);
        expect(_.getHistory()[0][1]).toEqual(2);
    });

    it('should be able to check a page revisit', () => {
        logHistory(pageConfig);
        expect(isRevisit(pageConfig.pageId)).toBeFalsy();

        logHistory(pageConfig);
        expect(isRevisit(pageConfig.pageId)).toBeTruthy();
    });

    it('should only store 50 latest entries', () => {
        const chance = new Chance();
        const max = [];

        while (max.length < 50) {
            max.push([chance.string(), 1]);
        }

        localStorageStub.set('gu.history', max);

        logHistory(pageConfig);

        expect(_.getHistory().length).toEqual(50);
    });

    it('should increment a count in the summary, for the 1st value from each of various page metadata', () => {
        logSummary(pageConfig);

        /* eslint-disable dot-notation */
        expect(_.getSummary().tags['foobar'][0]).toEqual('Foobar Section');
        expect(_.getSummary().tags['foobar'][1][0][1]).toEqual(1);
        /* eslint-enable dot-notation */

        expect(_.getSummary().tags['foo/bar'][0]).toEqual('Foobar Tag');
        expect(_.getSummary().tags['foo/bar'][1][0][1]).toEqual(1);
        expect(_.getSummary().tags['baz/poo']).toBeUndefined();

        expect(_.getSummary().tags['foo/series/bar'][0]).toEqual(
            'Foobar Series'
        );
        expect(_.getSummary().tags['foo/series/bar'][1][0][1]).toEqual(1);

        expect(_.getSummary().tags['profile/finbarrsaunders'][0]).toEqual(
            'Finbarr Saunders'
        );
        expect(_.getSummary().tags['profile/finbarrsaunders'][1][0][1]).toEqual(
            1
        );
        expect(_.getSummary().tags['profile/rogermellie']).toBeUndefined();

        logSummary(pageConfig);
        logSummary(pageConfig);

        /* eslint-disable dot-notation */
        expect(_.getSummary().tags['foobar'][0]).toEqual('Foobar Section');
        expect(_.getSummary().tags['foobar'][1][0][1]).toEqual(3);
        /* eslint-enable dot-notation */
    });

    it('should age the data points in the the summary', () => {
        /* eslint-disable dot-notation */
        expect(
            _.pruneSummary({
                periodEnd: today,
                tags: { foo: ['Foo', [[0, 1]]] },
            }).tags['foo'][1][0][0]
        ).toEqual(0);

        expect(
            _.pruneSummary({
                periodEnd: today - 5,
                tags: { foo: ['Foo', [[0, 1]]] },
            }).tags['foo'][1][0][0]
        ).toEqual(5);
        /* eslint-enable dot-notation */
    });

    it('should drop the obsoleted data points from the summary', () => {
        /* eslint-disable dot-notation */
        expect(
            _.pruneSummary({
                periodEnd: today - 500,
                tags: { foo: ['Foo', [[0, 1]]] },
            }).tags['foo']
        ).toBeUndefined();
        /* eslint-enable dot-notation */
    });

    it('should return equally visited items in last-in-first-out order', () => {
        logSummary(oftenVisited, today);
        logSummary(lessVisited, today);

        logSummary(oftenVisited, today + 1);
        logSummary(lessVisited, today + 1);

        logSummary(oftenVisited, today + 2);
        logSummary(lessVisited, today + 2);

        expect(getPopular()[0][0]).toEqual('less/visited');

        expect(getPopular()[1][0]).toEqual('often/visited');
    });

    it('should return most visited items first', () => {
        logSummary(oftenVisited, today);
        logSummary(oftenVisited, today);
        logSummary(lessVisited, today);

        logSummary(oftenVisited, today + 1);
        logSummary(lessVisited, today + 1);

        logSummary(oftenVisited, today + 2);
        logSummary(lessVisited, today + 2);

        expect(getPopular()[0][0]).toEqual('often/visited');

        expect(getPopular()[1][0]).toEqual('less/visited');
    });

    describe('series summary', () => {
        const pages = [
            {
                pageId: '111',
                section: 'a/series/b',
                sectionName: 'A series (two views)',
            },
            {
                pageId: '112',
                section: 'a/series/b',
                sectionName: 'A series (two views)',
            },
            {
                pageId: '222',
                section: 'g/series/h',
                sectionName: 'Another series',
            },
            {
                pageId: '333',
                section: 'j/series/k',
                sectionName: 'A different series',
            },
            {
                pageId: '444',
                section: 'x/series/y',
                sectionName: 'A really different series',
            },
            {
                pageId: '555',
                section: 'a/sport/z',
                sectionName: 'Not a series',
            },
        ];

        beforeEach(() => {
            pages.forEach((page, i) => {
                logSummary(page, today + i);
            });
        });

        it('should calculate series summary', () => {
            expect(seriesSummary()).toEqual({
                'a/series/b': 2,
                'g/series/h': 1,
                'j/series/k': 1,
                'x/series/y': 1,
            });
        });

        it('should calculate most viewed series', () => {
            expect(mostViewedSeries()).toEqual('a/series/b');
        });
    });

    it('strips edition from matching pageId', () => {
        expect(_.collapsePath('uk/business')).toEqual('business');
    });

    it('does not strips edition from non-matching pageId', () => {
        expect(_.collapsePath('uk/xxx')).toEqual('uk/xxx');
    });

    it('removes tags from megaNav', () => {
        const megaNav = document.createElement('div');

        megaNav.classList.add('js-global-navigation');

        megaNav.innerHTML =
            '<div class="js-global-navigation__section--history"></div>' +
            '<div class="js-global-navigation__section--history"></div>';

        if (document.body) {
            document.body.appendChild(megaNav);
        }

        logSummary(pageConfig);

        expect(
            megaNav.querySelectorAll('.js-global-navigation__section--history')
                .length
        ).toEqual(2);

        showInMegaNavEnable(false);

        expect(
            megaNav.querySelectorAll('.js-global-navigation__section--history')
                .length
        ).toEqual(0);
    });

    it('adds tags to megaNav', () => {
        const megaNav = document.createElement('div');

        megaNav.classList.add('js-global-navigation');

        if (document.body) {
            document.body.appendChild(megaNav);
        }

        logSummary(pageConfig);

        expect(
            megaNav.querySelectorAll('.js-global-navigation__section--history')
                .length
        ).toEqual(0);

        showInMegaNavEnable(true);

        expect(
            megaNav.querySelectorAll('.js-global-navigation__section--history')
                .length
        ).toEqual(1);
    });

    it('get contributor names', () => {
        logSummary(pageConfig);

        expect(getContributors().length).toEqual(1);
        expect(getContributors()[0][0]).toEqual('Finbarr Saunders');
    });

    // dailyArticleCount tests
    it('gets article count for today only', () => {
        const counts = [{ day: today, count: 1 }, { day: today - 1, count: 1 }];
        localStorageStub.set('gu.history.dailyArticleCount', counts);

        expect(getArticleViewCountForDays(1)).toEqual(1);
    });

    it('gets article count for 2 days', () => {
        const counts = [{ day: today, count: 1 }, { day: today - 1, count: 1 }];
        localStorageStub.set('gu.history.dailyArticleCount', counts);

        expect(getArticleViewCountForDays(2)).toEqual(2);
    });

    it('increments the daily article count', () => {
        const counts = [{ day: today, count: 1 }];
        localStorageStub.set('gu.history.dailyArticleCount', counts);

        incrementDailyArticleCount(pageConfig);

        expect(getArticleViewCountForDays(1)).toEqual(2);
    });

    it('increments the yearly article count', () => {
        const counts = [{ day: today, count: 1 }];
        localStorageStub.set('gu.history.dailyArticleCount', counts);

        incrementDailyArticleCount(pageConfig);

        expect(getArticleViewCountForDays(1)).toEqual(2);
    });

    it('removes old daily history while incrementing the article count', () => {
        const counts = [{ day: today - 70, count: 9 }];
        localStorageStub.set('gu.history.dailyArticleCount', counts);

        incrementDailyArticleCount(pageConfig);

        expect(localStorageStub.get('gu.history.dailyArticleCount')).toEqual([
            { day: today, count: 1 },
        ]);
    });

    // weeklyArticleCountB tests
    it('gets weekly count for this week only', () => {
        const counts = [
            { week: startOfThisWeek, count: 1 },
            { week: startOfThisWeek - 7, count: 1 },
        ];
        localStorageStub.set('gu.history.weeklyArticleCount', counts);

        expect(getArticleViewCountForWeeks(1)).toEqual(1);
    });

    it('gets article count for 2 weeks', () => {
        const counts = [
            { week: startOfThisWeek, count: 1 },
            { week: startOfThisWeek - 7, count: 1 },
        ];
        localStorageStub.set('gu.history.weeklyArticleCount', counts);

        expect(getArticleViewCountForWeeks(2)).toEqual(2);
    });

    it('increments the weekly article count', () => {
        const counts = [{ week: startOfThisWeek, count: 1 }];
        localStorageStub.set('gu.history.weeklyArticleCount', counts);

        incrementWeeklyArticleCount(pageConfig);

        expect(getArticleViewCountForWeeks(1)).toEqual(2);
    });

    it('removes old weekly history while incrementing the article count', () => {
        const counts = [{ week: startOfThisWeek - 400, count: 9 }];
        localStorageStub.set('gu.history.weeklyArticleCount', counts);

        incrementWeeklyArticleCount(pageConfig);

        expect(localStorageStub.get('gu.history.weeklyArticleCount')).toEqual([
            { week: startOfThisWeek, count: 1 },
        ]);
    });
});
