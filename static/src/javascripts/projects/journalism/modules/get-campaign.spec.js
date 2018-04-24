// @flow

import { getCampaign } from 'journalism/modules/get-campaign';
import config from 'lib/config';

jest.mock('lib/config');

const twoCampaigns = [
    {
        id: '3021acc9-97d9-40e0-869c-e23a2a8c530d',
        name: 'Callout 1',
        rules: [],
        priority: 0,
        activeFrom: 1520985600000,
        displayOnSensitive: false,
        fields: {
            callout: 'Has this happened to you?',
            formId: 2994970,
            description: 'Tell us your story and upload a file',
            formFields: [],
            _type: 'callout',
        },
    },
    {
        id: '6affc37c-e532-4ffe-a2d7-044a79f518ee',
        name: 'Epic Always Ask strategy',
        rules: [],
        priority: 0,
        activeFrom: 1481068800000,
        displayOnSensitive: false,
        fields: {
            campaignId: 'epic_always_ask_strategy',
            _type: 'epic',
        },
    },
    {
        id: '31b0ff60-04a5-4d45-ad76-bc9791cb78ab',
        name: 'Exciting callout number 3',
        rules: [],
        priority: 0,
        displayOnSensitive: false,
        fields: {
            callout: 'Do you have a supermarket near you?',
            formId: 3028078,
            description: 'How far away is it?',
            formFields: [],
            _type: 'callout',
        },
    },
];

const oneCampaign = [
    {
        id: '6affc37c-e532-4ffe-a2d7-044a79f518ee',
        name: 'Epic Always Ask strategy',
        rules: [],
        priority: 0,
        activeFrom: 1481068800000,
        displayOnSensitive: false,
        fields: {
            campaignId: 'epic_always_ask_strategy',
            _type: 'epic',
        },
    },
    {
        id: '31b0ff60-04a5-4d45-ad76-bc9791cb78ab',
        name: 'Exciting callout number 3',
        rules: [],
        priority: 0,
        displayOnSensitive: false,
        fields: {
            callout: 'Do you have a supermarket near you?',
            formId: 3028078,
            description: 'How far away is it?',
            formFields: [],
            _type: 'callout',
        },
    },
];

describe('Finding the callouts to display ', () => {
    beforeEach(() => {
        config.page = {
            campaigns: oneCampaign,
        };
    });

    afterEach(() => {
        delete config.page;
    });

    it('it shows a callout campaign if there is one present', () => {
        const callout1 = {
            title: 'Do you have a supermarket near you?',
            description: 'How far away is it?',
            formFields: [],
            formId: 3028078,
        };

        expect(getCampaign()).toEqual(callout1);
    });

    // change this when new targeting rules come in
    it('if there are two or more callout campaigns, it shows the first one', () => {
        config.page.campaigns = twoCampaigns;
        const callout2 = {
            title: 'Has this happened to you?',
            description: 'Tell us your story and upload a file',
            formFields: [],
            formId: 2994970,
        };
        expect(getCampaign()).toEqual(callout2);
    });

    it('if there are no callout campaigns, nothing is shown', () => {
        config.page.campaigns = [];
        expect(getCampaign()).toEqual(undefined);
    });
});
