// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';

const buildButtonTemplate = ({ supportUrl }) =>
    `<div class="contributions__amount-field">
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member contributions__contribute--epic-single-button"
               href="${supportUrl}"
               target="_blank">
                Support the Guardian
            </a>
        </div>
    </div>`;

const campaignCode = 'gdnwb_copts_memco_sandc_support_baseline';

// TODO: is it OK to hard-code straight to UK? given that this is a UK-only test...
const membershipSupporterUrl =
    'https://membership.theguardian.com/uk/supporter';

// gdnwb_copts_memco_sandc_support_baseline_support_epic

export const acquisitionsSupportBaseline = makeABTest({
    id: 'AcquisitionsSupportBaseline',
    campaignId: 'sandc_support_baseline',

    start: '2017-08-21',
    expiry: '2017-10-13',

    author: 'svillafe',
    description: 'Test new S&C proposition against current membership',
    successMeasure: 'Annualised value',
    idealOutcome:
        'The new proposition delivers the same or greater annualised value',

    audienceCriteria: 'UK all devices',
    audience: 1,
    audienceOffset: 0,
    locations: ['GB'],

    campaignSuffix: 'epic',

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                useTailoredCopyForRegulars: true,
                test(render) {
                    render();

                    [
                        ...document.getElementsByClassName('js-become-member'),
                    ].forEach(el => {
                        if (el instanceof HTMLAnchorElement) {
                            el.href = `${membershipSupporterUrl}?INTCMP=${campaignCode}_control_header`;
                        }
                    });
                },

                engagementBannerParams: {
                    campaignCode: `${campaignCode}_control_banner`,
                },
            },
        },
        {
            id: 'support',
            products: [
                'CONTRIBUTION',
                'RECURRING_CONTRIBUTION',
                'DIGITAL_SUBSCRIPTION',
            ],

            // EPIC
            options: {
                buttonTemplate: buildButtonTemplate,
                supportCustomURL: 'https://support.theguardian.com/uk',
                useTailoredCopyForRegulars: true,

                test(render) {
                    render();

                    // HEADER
                    [
                        ...document.getElementsByClassName('js-become-member'),
                    ].forEach(el => {
                        if (el instanceof HTMLAnchorElement) {
                            el.innerHTML = 'Support the Guardian';
                            el.href = `https://support.theguardian.com/uk?INTCMP=${campaignCode}_support_header`;
                        }
                    });
                },

                // ENGAGEMENT BANNER
                engagementBannerParams: {
                    buttonCaption: 'Support the Guardian',
                    linkUrl: `https://support.theguardian.com/uk?INTCMP=${campaignCode}_support_banner`,
                },
            },
        },
    ],
});
