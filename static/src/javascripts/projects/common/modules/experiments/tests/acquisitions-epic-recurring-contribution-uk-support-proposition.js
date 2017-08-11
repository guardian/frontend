// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import template from 'lodash/utilities/template';
import singleButtonTemplate from 'raw-loader!common/views/acquisitions-epic-single-button.html';

const buildButtonTemplate = ({ supportUrl }) =>
    template(singleButtonTemplate, {
        url: supportUrl,
    });

export const acquisitionsEpicRecurringContributionUkSupportProposition = makeABTest(
    {
        id: 'AcquisitionsEpicRecurringContributionUkSupportProposition',
        campaignId: 'sandc_epic_recurring_contribution_uk_support_proposition',

        start: '2017-08-07',
        expiry: '2017-09-13',

        author: 'svillafe',
        description:
            'This creates a two button version of the epic that links off to the new support frontend contribution landing page',
        successMeasure: 'Annualised value',
        idealOutcome:
            'We see an uplift in annualised value when recurring contributions are available.',

        audienceCriteria: 'UK all devices',
        audience: 1,
        audienceOffset: 0,
        locations: ['GB'],

        variants: [
            {
                id: 'control',
                products: ['ONE_OFF_CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
                options: {
                    useTailoredCopyForRegulars: true,
                },
            },
            {
                id: 'variant',
                products: ['ONE_OFF_CONTRIBUTION', 'RECURRING_CONTRIBUTION'],
                options: {
                    buttonTemplate: buildButtonTemplate,
                    supportCustomURL:
                        'https://support.theguardian.com/uk/contribute',
                    useTailoredCopyForRegulars: true,
                },
            },
        ],
    }
);
