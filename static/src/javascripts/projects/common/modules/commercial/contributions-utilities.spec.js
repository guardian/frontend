// @flow

import { buildConfiguredEpicTestFromJson } from './contributions-utilities';

jest.mock('lib/raven');
jest.mock('ophan/ng', () => null);

const rawTest = {
    name: 'My test',
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
            backgroundImageUrl: '',
            maxViews: {
                maxViewsDays: 30,
                maxViewsCount: 4,
                minDaysBetweenViews: 0,
            },
            classNames: ['test-class'],
        },
    ],
    highPriority: false,
    useLocalViewLog: false,
};

describe('buildConfiguredEpicTestFromJson', () => {
    it('Parses and constructs an epic test', () => {
        const test = buildConfiguredEpicTestFromJson(rawTest);
        expect(test.id).toBe('My test');
        expect(test.useLocalViewLog).toBe(false);
        expect(test.userCohort).toBe('AllNonSupporters');

        // Have to cast here because type is `Variant`
        // $FlowFixMe
        const variant = (test.variants[0]: EpicVariant);
        expect(variant.id).toBe('Control');
        expect(variant.countryGroups).toEqual(['UnitedStates', 'Australia']);
        expect(variant.tagIds).toEqual(['football/football']);
        expect(variant.classNames).toEqual(['test-class']);
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
