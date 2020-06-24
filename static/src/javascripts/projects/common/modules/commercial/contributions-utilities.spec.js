// @flow

import { getCookie as getCookie_ } from 'lib/cookies';
import config from 'lib/config';
import { buildConfiguredEpicTestFromJson, replaceArticlesViewed } from './contributions-utilities';

jest.mock('lib/raven');
jest.mock('ophan/ng', () => null);

const getCookie: any = getCookie_;

jest.mock('lib/cookies', () => ({
    getCookie: jest.fn(),
}));

const rawTest = {
    name: 'my_test',
    isOn: true,
    locations: ['UnitedStates', 'Australia'],
    tagIds: ['football/football'],
    sections: [],
    excludedTagIds: [],
    excludedSections: [],
    alwaysAsk: false,
    isLiveBlog: false,
    hasCountryName: false,
    variants: [
        {
            name: 'Control',
            heading: 'This was made using the new tool!',
            paragraphs: ['testing testing', 'this is a test'],
            highlightedText: 'Some highlighted text',
            footer: '',
            showTicker: false,
            showReminderFields: null,
            backgroundImageUrl: '',
        },
    ],
    highPriority: false,
    useLocalViewLog: false,
    articlesViewedSettings: {
        minViews: 5,
        maxViews: 10,
        periodInWeeks: 4,
    },
    maxViews: {
        maxViewsDays: 30,
        maxViewsCount: 4,
        minDaysBetweenViews: 0,
    },
};

describe('buildConfiguredEpicTestFromJson', () => {
    it('Parses and constructs an epic test', () => {
        const test: InitEpicABTest = buildConfiguredEpicTestFromJson(rawTest);
        expect(test.id).toBe('my_test');
        expect(test.useLocalViewLog).toBe(false);
        expect(test.userCohort).toBe('AllNonSupporters');

        expect(test.articlesViewedSettings).toEqual({
            minViews: 5,
            maxViews: 10,
            count: 0,
        });

        const variant: InitEpicABTestVariant = test.variants[0];
        expect(variant.id).toBe('Control');
        expect(variant.countryGroups).toEqual(['UnitedStates', 'Australia']);
        expect(variant.tagIds).toEqual(['football/football']);
        expect(variant.classNames).toEqual([
            'contributions__epic--my_test',
            'contributions__epic--my_test-Control',
        ]);
        expect(variant.copy).toEqual({
            heading: 'This was made using the new tool!',
            paragraphs: ['testing testing', 'this is a test'],
            footer: [],
            highlightedText: 'Some highlighted text',
        });

        expect(test.deploymentRules).toEqual({
            days: 30,
            count: 4,
            minDaysBetweenViews: 0,
        });
    });
});

describe('replaceArticlesViewed', () => {
    it('should do nothing if no template', () => {
        const text = 'This has no template.';
        expect(replaceArticlesViewed(text, 5)).toBe(text)
    });

    it('should replace the template with just the count', () => {
        const text = 'You have read %%ARTICLE_COUNT%% articles.';
        expect(replaceArticlesViewed(text, 5)).toBe('You have read <span class="epic-article-count__normal">5</span> articles.')
    });

    it('should replace the template with opt-out feature html', () => {
        config.set('switches.showArticlesViewedOptOut', true);
        getCookie.mockReturnValue(1);   // mvt values in the lower half of the range are in the variant

        const text = 'You have read %%ARTICLE_COUNT%% articles.';
        const expected = 'You have read \n' +
            '    <span class="epic-article-count">\n' +
            '        <input type="checkbox" id="epic-article-count__dialog-checkbox" class="epic-article-count__dialog-checkbox" />\n' +
            '        <label for="epic-article-count__dialog-checkbox" class="epic-article-count__prompt-label">\n' +
            '            <a>5  articles</a>\n' +
            '        </label>\n' +
            '        <span class="epic-article-count__dialog">\n' +
            '            <span class="epic-article-count__dialog-close is-hidden">\n' +
            '                <button tabindex="4" class="epic-article-count__dialog-close-button js-site-message-close" data-link-name="hide release message">\n' +
            '                    <span class="u-h">Close the articles viewed opt out message</span>\n' +
            '                    <svg></svg>\n' +
            '                </button>\n' +
            '            </span>\n' +
            '        \n' +
            '            <span class="epic-article-count__dialog-header">What\'s this?</span>\n' +
            '            <span class="epic-article-count__dialog-body">We would like to remind you how many Guardian articles you\'ve enjoyed on this device. Can we continue showing you this?</span>\n' +
            '            \n' +
            '            <span class="epic-article-count__buttons">\n' +
            '                <a class="component-button component-button--hasicon-right contributions__contribute--epic-member epic-article-count__button-opt-in"\n' +
            '                  target="_blank">\n' +
            '                  Yes, that\'s OK\n' +
            '                </a>\n' +
            '\n' +
            '                <a class="component-button component-button--hasicon-right contributions__contribute--epic-member epic-article-count__button-opt-out"\n' +
            '                  target="_blank">\n' +
            '                  No, opt me out\n' +
            '                </a>\n' +
            '            </span>\n' +
            '            \n' +
            '            <span class="epic-article-count__dialog-note">Please note you cannot undo this action or opt back in</span>\n' +
            '        </span>\n' +
            '    </span>\n' +
            '.';

        expect(replaceArticlesViewed(text, 5)).toBe(expected)
    });
});
