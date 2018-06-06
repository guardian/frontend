// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { control, thankyou } from 'common/modules/commercial/acquisitions-copy';
import { acquisitionsEpicBorderTemplate } from 'common/modules/commercial/templates/acquisitions-epic-border';

const abTestName = 'AcquisitionsEpicBorderThankyou';

export const AcquisitionsEpicBorderThankyou: EpicABTest = makeABTest({
    id: abTestName,
    campaignId: abTestName,

    start: '2018-05-23',
    expiry: '2018-06-05',

    author: 'Jonathan Rankin',
    description:
        'Try 2 variants - one adding a border to the epic and one with copy thanking our readers',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Both variants beat the control',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    variants: [
        {
            id: 'control',
            products: [],
        },
        {
            id: 'border',
            products: [],
            options: {
                template(variant) {
                    return acquisitionsEpicBorderTemplate({
                        copy: control,
                        componentName: variant.options.componentName,
                        buttonTemplate: variant.options.buttonTemplate({
                            supportUrl: variant.options.supportURL,
                        }),
                        testimonialBlock: variant.options.testimonialBlock,
                    });
                },
            },
        },
        {
            id: 'thankyou',
            products: [],
            options: {
                copy: thankyou,
            },
        },
    ],
});
