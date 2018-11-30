// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { acquisitionsEpicUsTickerTemplate } from 'common/modules/commercial/templates/acquisitions-epic-us-ticker';
import type { EpicTemplate } from 'common/modules/commercial/contributions-utilities';
import { initTicker } from 'common/modules/commercial/ticker';
import type { TickerPosition } from 'common/modules/commercial/templates/acquisitions-epic-us-ticker';

const abTestName = 'AcquisitionsEpicUsTopTicker';

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

const criticalTimesCopy: AcquisitionsEpicTemplateCopy = {
    heading: 'In these critical times &hellip;',
    paragraphs: [
        '&hellip; please help us protect independent journalism at a time when factual, trustworthy reporting is under threat by making a year-end gift to support The Guardian. We’re asking our US readers to help us raise one million dollars by the new year so that we can report on the stories that matter in 2019. Small or big, every contribution will help us reach our goal.',
        'The Guardian’s independence means that we can report on the stories that matter and pursue difficult investigations, challenging the powerful and holding them to account. No one edits our editor. No one steers our opinion. Our journalists have the freedom to report on the facts, with no commercial bias and without politicians or shareholders influencing their work.',
        'In 2018, The Guardian broke the story of Cambridge Analytica’s Facebook data breach; we recorded the human fallout from family separations; we charted the rise of the far right, and documented the growing impact of gun violence on Americans’ lives. We reported daily on climate change as a matter of urgent priority. It was readers’ support that made this work possible.',
        'As 2019 approaches, we would like to ask for your ongoing support. Reaching our year-end target will ensure that we can keep delivering factual reporting at a critical time in US history. In an era of disinformation campaigns and partisan bots, trustworthy news sources that sort facts from lies are under threat like never before. With the free press and individual journalists increasingly under attack, The Guardian is committed to exposing wrongdoing and uncovering the truth.',
        'We are living in confusing times and understand that it can be tempting to turn away from news coverage. But we hope you feel, as we do, that we have to make sense of the world if we’re going to have a chance of making it a better place. Our approach allows us to keep our factual journalism open to everyone, regardless of where they live or what they can afford. We are so encouraged by the support we have already received from our readers, and we want to say thank you. But we need many more readers to join for each year to come.',
    ],
    highlightedText:
        'By giving a year-end gift - however big or small - you are supporting The Guardian’s independence and ensuring we can keep delivering factual, trustworthy journalism for the years to come. Thank you.',
};

const independentCopy: AcquisitionsEpicTemplateCopy = {
    heading: 'In these critical times &hellip;',
    paragraphs: [
        '&hellip; a robust free press which offers trustworthy, fact-based reporting is more important than ever. We’re asking our US readers to help us raise one million dollars by early next year to help us report on the stories that matter most in 2019. Small or big, every contribution you give will help us hit our goal.',
        'The Guardian’s editorial independence means that we can pursue difficult investigations, challenging the powerful and holding them to account. No one edits our editor and no one steers our opinion.',
        'In 2018, The Guardian broke the story of Cambridge Analytica’s Facebook data breach; we recorded the human fallout from family separations; we charted the rise of the far right, and documented the growing impact of gun violence on Americans’ lives. We reported daily on climate change as a matter of urgent priority. It was readers’ support that made this work possible.',
        'As 2019 approaches, we need your ongoing support to protect independent journalism. Unlike many others, we haven’t put up a paywall – The Guardian’s reporting is open and accessible to everyone, regardless of what they can afford. But we depend on voluntary contributions from readers.',
        'We’re in this together – with your support we can keep exposing the truth. We hope to pass our goal by early January 2019. We want to say a huge thank you to everyone who has supported The Guardian so far.',
    ],
    highlightedText:
        'Please invest in our independent journalism today by making a year-end gift.',
};

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

const goalCopy: AcquisitionsEpicTemplateCopy = {
    heading: 'Hi there, we’re off to a great start &hellip;',
        paragraphs: [
        '&hellip; but we need your help to hit our goal! At a time when factual, trustworthy journalism is under threat, we’re asking our readers to help us raise one million dollars by the new year. We’ve made great progress in the first few days of this campaign – and with your help we can push this over the line by the New Year! Small or big, every contribution you give will help us tell the stories that matter most in 2019.',
        'The Guardian’s editorial independence means that we can pursue difficult investigations, challenging the powerful and holding them to account. No one edits our editor and no one steers our opinion.',
        'In 2018, The Guardian broke the story of Cambridge Analytica’s Facebook data breach; we recorded the human fallout from family separations; we charted the rise of the far right, and documented the growing impact of gun violence on Americans’ lives. We reported daily on climate change as a matter of urgent priority. It was readers’ support that made this work possible.',
        'As 2019 approaches, we need your ongoing support to protect independent journalism. Unlike many others, we haven’t put up a paywall – The Guardian’s reporting is open and accessible to everyone, regardless of what they can afford. But we depend on voluntary contributions from readers.',
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
            id: 'us_eoy_critical_times_top_ticker',
            products: [],
            options: {
                copy: criticalTimesCopy,
                template: createTemplate('TOP'),
                onView: () => {
                    initTicker();
                },
            },
        },
        {
            id: 'US2018_EOY_4_Independent',
            products: [],
            options: {
                copy: independentCopy,
                template: createTemplate('TOP'),
                onView: () => {
                    initTicker();
                },
            },
        },
        {
            id: 'US2018_EOY_4_ShorterITCT',
            products: [],
            options: {
                copy: shorterCopy,
                template: createTemplate('TOP'),
                onView: () => {
                    initTicker();
                },
            },
        },
        {
            id: 'US2018_EOY_4_Goal',
            products: [],
            options: {
                copy: goalCopy,
                template: createTemplate('TOP'),
                onView: () => {
                    initTicker();
                },
            },
        },
    ],
});
