// @flow

import { buildConfiguredEpicTestFromJson } from './contributions-utilities';

jest.mock('lib/raven');
jest.mock('ophan/ng', () => null);

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
            maxViews: {
                maxViewsDays: 30,
                maxViewsCount: 4,
                minDaysBetweenViews: 0,
            },
        },
    ],
    highPriority: false,
    useLocalViewLog: false,
    articlesViewedSettings: {
        minViews: 5,
        maxViews: 10,
        periodInWeeks: 4,
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

        expect(variant.deploymentRules).toEqual({
            days: 30,
            count: 4,
            minDaysBetweenViews: 0,
        });
    });
});
