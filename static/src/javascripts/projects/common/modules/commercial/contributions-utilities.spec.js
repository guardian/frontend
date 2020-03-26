// @flow

import { overwriteMvtCookie } from 'common/modules/analytics/mvt-cookie';
import {
    buildConfiguredEpicTestFromJson,
    makeEpicABTest,
} from './contributions-utilities';
import { setGeolocation } from '../../../../lib/geolocation';
import config from '../../../../lib/config';
import { local } from '../../../../lib/storage';

jest.mock('lib/raven');
jest.mock('ophan/ng', () => null);

// const rawTest = {
//     name: 'my_test',
//     isOn: true,
//     locations: ['UnitedStates', 'Australia'],
//     tagIds: ['football/football'],
//     sections: [],
//     excludedTagIds: [],
//     excludedSections: [],
//     alwaysAsk: false,
//     isLiveBlog: false,
//     hasCountryName: false,
//     variants: [
//         {
//             name: 'Control',
//             heading: 'This was made using the new tool!',
//             paragraphs: ['testing testing', 'this is a test'],
//             highlightedText: 'Some highlighted text',
//             footer: '',
//             showTicker: false,
//             showReminderFields: null,
//             backgroundImageUrl: '',
//             maxViews: {
//                 maxViewsDays: 30,
//                 maxViewsCount: 4,
//                 minDaysBetweenViews: 0,
//             },
//         },
//     ],
//     highPriority: false,
//     useLocalViewLog: false,
//     articlesViewedSettings: {
//         minViews: 5,
//         maxViews: 10,
//         periodInWeeks: 4,
//     },
// };

// describe('buildConfiguredEpicTestFromJson', () => {
//     it('Parses and constructs an epic test', () => {
//         const test: InitEpicABTest = buildConfiguredEpicTestFromJson(rawTest);
//         expect(test.id).toBe('my_test');
//         expect(test.useLocalViewLog).toBe(false);
//         expect(test.userCohort).toBe('AllNonSupporters');
//
//         expect(test.articlesViewedSettings).toEqual({
//             minViews: 5,
//             maxViews: 10,
//             count: 0,
//         });
//
//         const variant: InitEpicABTestVariant = test.variants[0];
//         expect(variant.id).toBe('Control');
//         expect(variant.countryGroups).toEqual(['UnitedStates', 'Australia']);
//         expect(variant.tagIds).toEqual(['football/football']);
//         expect(variant.classNames).toEqual([
//             'contributions__epic--my_test',
//             'contributions__epic--my_test-Control',
//         ]);
//         expect(variant.copy).toEqual({
//             heading: 'This was made using the new tool!',
//             paragraphs: ['testing testing', 'this is a test'],
//             footer: [],
//             highlightedText: 'Some highlighted text',
//         });
//
//         expect(variant.deploymentRules).toEqual({
//             days: 30,
//             count: 4,
//             minDaysBetweenViews: 0,
//         });
//     });
// });

const setViewLog = (log: any): void => {
    local.set('gu.contributions.views', log);
};

const setPageMeta = (
    contentType: string,
    section: string,
    keywordIDs: Array<string>
) => {
    config.set('page.contentType', contentType);
    config.set('page.section', section);
    config.set('page.keywordIds', keywordIDs);
};

const setMVTID = (ID: number) => {
    overwriteMvtCookie(ID);
};

const setCountryCode = (code: string) => {
    setGeolocation(code);
};

const setArticleViews = (log: any): void => {
    local.set('gu.history.weeklyArticleCount', log);
};

const setTracking = (tracking: any) => {
    setViewLog(tracking.epicViewLog);
    setPageMeta(tracking.contentType, tracking.sectionName, tracking.tags);
    setMVTID(tracking.mvtId);
    setCountryCode(tracking.countryCode);
    setArticleViews(tracking.weeklyArticleHistory);
};

// get this from the test JSON (example below)
const annoyingTest = {
    "name" : "2020-03-26_GLOBAL_EPIC_ROUND7__WITH_ARTICLE_COUNT",
    "nickname" : "GLOBAL EPIC INDEPENDENCE WITH AC",
    "isOn" : true,
    "locations" : [
        "AUDCountries",
        "Canada",
        "EURCountries",
        "NZDCountries",
        "GBPCountries",
        "International"
    ],
    "tagIds" : [
    ],
    "sections" : [
    ],
    "excludedTagIds" : [
    ],
    "excludedSections" : [
    ],
    "alwaysAsk" : false,
    "maxViews" : {
        "maxViewsCount" : 4,
        "maxViewsDays" : 30,
        "minDaysBetweenViews" : 0
    },
    "userCohort" : "AllNonSupporters",
    "isLiveBlog" : false,
    "hasCountryName" : false,
    "variants" : [
        {
            "name" : "CONTROL",
            "heading" : "Since you’re here...",
            "paragraphs" : [
                "… we’re asking readers like you to make a contribution in support of our open, independent journalism. In these frightening and uncertain times, the expertise, scientific knowledge and careful judgment in our reporting has never been so vital. No matter how unpredictable the future feels, we will remain with you, delivering high quality news so we can all make critical decisions about our lives, health and security. Together we can find a way through this.",
                "",
                "We believe every one of us deserves equal access to accurate news and calm explanation. So, unlike many others, we made a different choice: to keep Guardian journalism open for all, regardless of where they live or what they can afford to pay. This would not be possible without the generosity of readers, who now support our work from 180 countries around the world.",
                "",
                "We have upheld our editorial independence in the face of the disintegration of traditional media – with social platforms giving rise to misinformation, the seemingly unstoppable rise of big tech and independent voices being squashed by commercial ownership. The Guardian’s independence means we can set our own agenda and voice our own opinions. Our journalism is free from commercial and political bias – never influenced by billionaire owners or shareholders. This makes us different. It means we can challenge the powerful without fear and give a voice to those less heard.",
                "",
                "Your financial support has meant we can keep investigating, disentangling and interrogating. It has protected our independence, which has never been so critical. We are so grateful. ",
                "",
                "We need your support so we can keep delivering quality journalism that’s open and independent. And that is here for the long term. Every reader contribution, however big or small, is so valuable."
            ],
            "highlightedText" : "Support the Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.",
            "showTicker" : false,
            "cta" : {
                "text" : "Support The Guardian",
                "baseUrl" : "https://support.theguardian.com/contribute"
            },
            "secondaryCta" : {
                "text" : "",
                "baseUrl" : "https://www.theguardian.com/world/2020/mar/20/coronavirus-the-guardians-promise-to-our-readers?INTCMP=covid-kath-article"
            }
        },
        {
            "name" : "V1_INDEPENDENCE_LEAD",
            "heading" : "Since you’re here…",
            "paragraphs" : [
                "… we’re asking readers like you to make a contribution in support of our open, independent journalism. In these extraordinary times, the Guardian’s editorial independence has never been more important. Because no one sets our agenda, or edits our editor, we can keep delivering trustworthy, fact-checked journalism each and every day. Free from commercial or political bias, we can report fearlessly on world events and challenge those in power. ",
                "",
                "In these frightening and uncertain times, the expertise, scientific knowledge and careful judgment in our reporting has never been so vital. No matter how unpredictable the future feels, we will remain with you, delivering high quality news so we can all make critical decisions about our lives, health and security. Together we can find a way through this.",
                "",
                "We choose to keep our measured journalism open to everyone around the world, regardless of where they live or what they can afford to pay. We believe every one of us deserves equal access to accurate news and calm explanation. Thanks to your support, we’re able to stay free of a paywall, our reporting available for all. ",
                "",
                "None of this would be possible without the generosity of readers, who now support our work from 180 countries around the world. You have helped us to keep investigating, disentangling and interrogating. Your support protects our independence, which has never been so critical. We are so grateful. ",
                "",
                "We need your support so we can keep delivering quality journalism that’s open and independent. And that is here for the long term. Every reader contribution, however big or small, is so valuable."
            ],
            "highlightedText" : "Support the Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.",
            "showTicker" : false,
            "cta" : {
                "text" : "Support The Guardian",
                "baseUrl" : "https://support.theguardian.com/contribute"
            },
            "secondaryCta" : {
                "text" : "Hear from our editor",
                "baseUrl" : "https://www.theguardian.com/world/2020/mar/20/coronavirus-the-guardians-promise-to-our-readers?INTCMP=covid-kath-article"
            }
        },
        {
            "name" : "V2_EXTRAORDINARY_INDEPENDENCE",
            "heading" : "In these extraordinary times… ",
            "paragraphs" : [
                "… the Guardian’s editorial independence has never been more important. Because no one sets our agenda, or edits our editor, we can keep delivering trustworthy, fact-checked journalism each and every day. Free from commercial or political bias, we can report fearlessly on world events and challenge those in power.",
                "",
                "In these frightening and uncertain times, the expertise, scientific knowledge and careful judgment in our reporting has never been so vital. No matter how unpredictable the future feels, we will remain with you, delivering high quality news so we can all make critical decisions about our lives, health and security. Together we can find a way through this.",
                "",
                "We choose to keep our measured journalism open to everyone around the world, regardless of where they live or what they can afford to pay. We believe every one of us deserves equal access to accurate news and calm explanation. Thanks to your support, we’re able to stay free of a paywall, our reporting available for all. ",
                "",
                "None of this would be possible without the generosity of readers, who now support our work from 180 countries around the world. You have helped us to keep investigating, disentangling and interrogating. Your support protects our independence, which has never been so critical. We are so grateful. ",
                "",
                "We need your support so we can keep delivering quality journalism that’s open and independent. And that is here for the long term. Every reader contribution, however big or small, is so valuable."
            ],
            "highlightedText" : "Support the Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.",
            "showTicker" : false,
            "cta" : {
                "text" : "Support The Guardian",
                "baseUrl" : "https://support.theguardian.com/contribute"
            },
            "secondaryCta" : {
                "text" : "Hear from our editor",
                "baseUrl" : "https://www.theguardian.com/world/2020/mar/20/coronavirus-the-guardians-promise-to-our-readers?INTCMP=covid-kath-article"
            }
        }
    ],
    "highPriority" : false,
    "useLocalViewLog" : true
};

const annoyingTracking = undefined // put tracking object here

describe('explore epic variant choice', () => {
    it('really we run this to see what is logged', () => {
        setTracking(annoyingTracking);
        const t = buildConfiguredEpicTestFromJson(annoyingTest);
        const abTest = makeEpicABTest(t);
        expect(abTest.canRun()).toBe(false);
    });
});
