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
    alwaysAsk: true,
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
        },
    ],
    highPriority: false,
    maxViewsCount: 4,
    useLocalViewLog: false,
};

describe('buildConfiguredEpicTestFromJson', () => {
    it('Parses and constructs an epic test', () => {
        const test = buildConfiguredEpicTestFromJson(rawTest);
        console.log(test);
        expect(test.id).toBe('My test');
        expect(test.useLocalViewLog).toBe(false);
        expect(test.userCohort).toBe('AllNonSupporters');

        // Have to cast here because type is `Variant`
        // $FlowFixMe
        const variant = (test.variants[0]: EpicVariant);
        expect(variant.id).toBe('Control');
        expect(variant.countryGroups).toEqual(['UnitedStates', 'Australia']);
        expect(variant.tagIds).toEqual(['football/football']);
        expect(variant.copy.heading).toBe('This was made using the new tool!');
        expect(variant.copy.paragraphs).toEqual([
            'testing testing',
            'this is a test',
        ]);
    });
});
