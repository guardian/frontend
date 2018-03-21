// @flow
import {
    defaultCanEpicBeDisplayed,
    makeABTest,
} from 'common/modules/commercial/contributions-utilities';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import { keywordExists } from 'lib/page';

const abTestName = 'AcquisitionsEpicCambridgeAnalyticaMessaging';

export const acquisitionsEpicCambridgeAnalyticaMessaging: EpicABTest = makeABTest(
    {
        id: abTestName,
        campaignId: abTestName,

        start: '2018-03-20',
        expiry: '2018-04-10',

        author: 'Joseph Smith',
        description:
            'This test aims to measure the impact of custom messaging on "moment" stories',
        successMeasure: 'Conversion rate',
        idealOutcome:
            'We learn the impact of custom messaging on "moment" stories',

        audienceCriteria: 'All',
        audience: 0.8,
        audienceOffset: 0.2,
        overrideCanRun: true,
        canRun: test =>
            keywordExists(['Cambridge Analytica']) &&
            defaultCanEpicBeDisplayed(test),

        variants: [
            {
                id: 'control',
                products: [],
                options: {
                    isUnlimited: true,
                },
            },
            {
                id: 'custom_message',
                products: [],
                options: {
                    isUnlimited: true,
                    template(variant) {
                        return acquisitionsEpicControlTemplate({
                            copy: {
                                heading: 'heading',
                                p1:
                                    '&hellip; now is the time to support investigative reporting. More than a year’s worth of work has gone into The Cambridge Analytica files: months of painstakingly gathered evidence pulled together by a small team of reporters and editors. We have received legal threats from Cambridge Analytica and from Facebook, which was rocked by news of the data breach, with $36bn wiped off its share price yesterday.',
                                p2:
                                    'Our readers increasingly fund The Guardian’s fearless, independent, investigative reporting on stories such as this. Unlike many news organisations, we have not put up a paywall – we want to keep our journalism as open as we can.',
                            },
                            componentName: variant.options.componentName,
                            buttonTemplate: variant.options.buttonTemplate({
                                contributeUrl: variant.options.contributeURL,
                                supportUrl: variant.options.supportURL,
                            }),
                        });
                    },
                },
            },
        ],
    }
);
