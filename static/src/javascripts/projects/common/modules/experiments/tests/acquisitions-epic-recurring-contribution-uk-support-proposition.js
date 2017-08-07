// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import template from 'lodash/utilities/template';
import singleButtonTemplate from 'raw-loader!common/views/acquisitions-epic-single-button.html';

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
        audience: 0.58, // TODO: Needs definition
        audienceOffset: 0.2, // TODO: Needs definition
        locations: ['GB'],

        variants: [
            {
                id: 'control',
                useTailoredCopyForRegulars: true,
            },
            {
                id: 'variant',

                buttonTemplate({ supportUrl }) {
                    template(singleButtonTemplate, {
                        url: supportUrl,
                    });
                },
                useTailoredCopyForRegulars: true,
            },
        ],
    }
);
