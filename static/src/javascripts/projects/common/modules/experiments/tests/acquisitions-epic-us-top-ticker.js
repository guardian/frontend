// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { acquisitionsEpicUsTickerTemplate } from 'common/modules/commercial/templates/acquisitions-epic-us-ticker';
import type { EpicTemplate } from 'common/modules/commercial/contributions-utilities';
import { initTicker } from 'common/modules/commercial/ticker';
import type { TickerPosition } from 'common/modules/commercial/templates/acquisitions-epic-us-ticker';

const abTestName = 'AcquisitionsEpicUsTopTickerRoundFive';

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

const shorterCopy: AcquisitionsEpicTemplateCopy = {
    heading: 'In these critical times &hellip;',
    paragraphs: [
        '&hellip; help us protect independent journalism at a time when factual, trustworthy reporting is under threat by making a year-end gift to support The Guardian. We’re asking our US readers to help us raise one million dollars by the new year so that we can report on the stories that matter in 2019. Small or big, every contribution you give will help us reach our goal.',
        'The Guardian’s editorial independence means that we can pursue difficult investigations, challenging the powerful and holding them to account. No one edits our editor and no one steers our opinion.',
        'In 2018, The Guardian broke the story of Cambridge Analytica’s Facebook data breach; we recorded the human fallout from family separations; we charted the rise of the far right, and documented the growing impact of gun violence on Americans’ lives. We reported daily on climate change as a matter of urgent priority. It was readers’ support that made this work possible.',
        'As 2019 approaches, we would like to ask for your ongoing support. In an era of disinformation campaigns and partisan bots, trustworthy news sources that sort facts from lies are under threat like never before. Unlike many others we haven’t put up a paywall – we want to keep The Guardian’s reporting open to everyone, regardless of what they can afford. But we depend on voluntary contributions from readers.',
        'We’re in this together – with your support we can keep exposing the truth. We hope to pass our goal by early January 2019. We want to say a huge thank you to everyone who has supported The Guardian so far.',
    ],
    highlightedText:
        'Please invest in our independent journalism today by making a year-end gift.',
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
            id: 'US2018_EOY_4_ShorterITCT',
            products: [],
            options: {
                copy: shorterCopy,
                template: createTemplate('TOP'),
                onView: () => {
                    initTicker('.js-epic-ticker');
                },
            },
        },
    ],
});
