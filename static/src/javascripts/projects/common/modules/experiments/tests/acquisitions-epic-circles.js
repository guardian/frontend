// @flow

// ----- Imports ----- //

import {
    makeABTest,
    defaultButtonTemplate,
} from 'common/modules/commercial/contributions-utilities';
import { acquisitionsEpicCirclesTemplate } from 'common/modules/commercial/templates/acquisitions-epic-circles';
import { circles as circlesCopy } from 'common/modules/commercial/acquisitions-copy';

// ----- Setup ----- //

const products = [
    'CONTRIBUTION',
    'RECURRING_CONTRIBUTION',
    'MEMBERSHIP_PATRON',
    'DIGITAL_SUBSCRIPTION',
    'PRINT_SUBSCRIPTION',
];

// ----- Test Definition ----- //

export const acquisitionsEpicCircles = makeABTest({
    id: 'SimpleAndCoherentCircles',
    campaignId: 'epic_circles',

    start: '2017-12-15',
    expiry: '2018-01-10',

    author: 'Ap0c',
    description: 'Show a custom Epic with the Circles design',
    successMeasure: 'AV2.0',
    idealOutcome: 'The overall flow with the Circles epic produces a higher AV',
    audienceCriteria: 'UK only',
    audience: 1,
    audienceOffset: 0,
    locations: ['GB'],

    variants: [
        {
            id: 'control',
            products,
        },
        {
            id: 'circles',
            products,
            options: {
                template(variant) {
                    return acquisitionsEpicCirclesTemplate({
                        copy: circlesCopy,
                        componentName: variant.options.componentName,
                        buttonTemplate: defaultButtonTemplate({
                            membershipUrl: variant.options.membershipURL,
                            contributeUrl: variant.options.contributeURL,
                            supportUrl: variant.options.supportURL,
                        }),
                    });
                },
            },
        },
    ],
});
