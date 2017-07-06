// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import template from 'lodash/utilities/template';
import singleButtonTemplate from 'raw-loader!common/views/acquisitions-epic-single-button.html';

const buildButtonTemplate = ({ supportUrl }) =>
    template(singleButtonTemplate, {
        url: supportUrl,
    });

export const acquisitionsEpicRebaselineSupportProposition = makeABTest({
    id: 'AcquisitionsEpicRebaselineSupportProposition',
    campaignId: 'sandc_epic_rebaseline_support_proposition',

    start: '2017-07-07',
    expiry: '2017-08-15',

    author: 'Ap0c',
    description:
        'This creates a single-button version of the epic that links off to the new support frontend bundles landing page',
    successMeasure: 'Conversion rate',
    idealOutcome:
        'We get a baseline for conversion of the bundles landing page',

    audienceCriteria: 'UK all devices',
    audience: 0,
    locations: ['GB'],
    audienceOffset: 0.9,

    variants: [
        {
            id: 'control',
            useTailoredCopyForRegulars: true,
        },
        {
            id: 'support_proposition',
            buttonTemplate: buildButtonTemplate,
            useTailoredCopyForRegulars: true,
        },
    ],
});
