// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { acquisitionsEpicUsTickerTemplate } from 'common/modules/commercial/templates/acquisitions-epic-us-ticker';
import type { EpicTemplate } from 'common/modules/commercial/contributions-utilities';
import { initTicker } from 'common/modules/commercial/ticker';
import type { TickerPosition } from 'common/modules/commercial/templates/acquisitions-epic-us-ticker';

const abTestName = 'AcquisitionsEpicUsTopTickerFinal';

const createTemplate = (tickerPosition: TickerPosition): EpicTemplate => (
    { options = {} },
    copy: AcquisitionsEpicTemplateCopy
) =>
    acquisitionsEpicUsTickerTemplate({
        copy,
        componentName: options.componentName,
        buttonTemplate: options.buttonTemplate({
            supportUrl: options.supportURL,
        }),
        tickerPosition,
    });

const noteFromJohn: AcquisitionsEpicTemplateCopy = {
    heading: 'In these critical times &hellip;',
    paragraphs: [
        '&hellip; The Guardian’s US editor John Mulholland urges you to show your support for independent journalism with a year-end gift to The Guardian. We are asking our US readers to help us raise $1 million dollars by early January to report on the most important stories in 2019.',
        'A note from John:',
        'In normal times we might not be making this appeal. But these are not normal times. Many of the values and beliefs we hold dear at The Guardian are under threat both here in the US and around the world. Facts, science, humanity, diversity and equality are being challenged daily. As is truth. Which is why we need your help.',
        'Powerful public figures choose lies over truths, prefer supposition over science; and select hate over humanity. The US administration is foremost among them; whether in denying climate science or hating on immigrants; giving succor to racists or targeting journalists and the media. Many of these untruths and attacks find fertile ground on social media where tech platforms seem unable to cauterise lies. As a result, fake is in danger of overriding fact.',
        'Almost 100 years ago, in 1921, the editor of The Guardian argued that the principal role of a newspaper was accurate reporting, insisting that &ldquo;facts are sacred.&rdquo; We still hold that to be true. The need for a robust, independent press has never been greater, but the challenge is more intense than ever as digital disruption threatens traditional media’s business model. We pride ourselves on not having a paywall because we believe truth should not come at a price for anyone. Our journalism remains open and accessible to everyone and with your help we can keep it that way.',
        'We want to say a huge thank you to everyone who has supported The Guardian so far. We hope to pass our goal by early January 2019. Every contribution, big or small, will help us reach it.',
    ],
    highlightedText:
        'Please make a year-end gift today to show your ongoing support for our independent journalism. Thank you.',
};

export const acquisitionsEpicUsTopTicker: EpicABTest = makeABTest({
    id: abTestName,
    campaignId: abTestName,
    start: '2018-04-17',
    expiry: '2019-06-05',
    author: 'Joseph Smith',
    description: 'Tests an epic with custom copy in US',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Alternative copy makes more money than the control',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    locations: ['US'],
    useLocalViewLog: true,
    variants: [
        {
            id: 'US_EoY_R7_John',
            products: [],
            options: {
                copy: noteFromJohn,
                template: createTemplate('TOP'),
                onView: () => {
                    initTicker('.js-epic-ticker');
                },
            },
        },
    ],
});
