// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { acquisitionsEpicUsTickerTemplate } from 'common/modules/commercial/templates/acquisitions-epic-us-ticker';
import type { EpicTemplate } from 'common/modules/commercial/contributions-utilities';
import { initTicker } from 'common/modules/commercial/ticker';
import type { TickerPosition } from 'common/modules/commercial/templates/acquisitions-epic-us-ticker';

const abTestName = 'AcquisitionsEpicUsEndOfYearRound2';

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

const somethingYouCanDoCopy: AcquisitionsEpicTemplateCopy = {
    heading: 'There’s something you can do &hellip;',
    paragraphs: [
        '&hellip; to protect independent journalism at a time when factual, trustworthy journalism is under threat. Please make a year-end gift to support The Guardian’s independent journalism. We’re asking our US readers to help us raise one million dollars by the new year to report on the stories that matter in 2019. Small or big, every contribution will help us reach our goal.',
        'The Guardian’s independence means that we can report on the stories that matter and pursue difficult investigations, challenging the powerful and holding them to account. No one edits our editor. No one steers our opinion. Our journalists have the freedom to report on the facts, with no commercial bias and without politicians or shareholders influencing their work.',
        'In 2018, The Guardian broke the story of Cambridge Analytica’s Facebook data breach; we recorded the human fallout from family separations; we charted the rise of the far right, and documented the growing impact of gun violence on Americans’ lives. We reported daily on climate change as a matter of urgent priority. It was readers’ support that made this work possible.',
        'As 2019 approaches, we would like to ask for your ongoing support. Reaching our year-end target will ensure that we can keep delivering factual reporting at a critical time in US history. In an era of disinformation campaigns and partisan bots, trustworthy news sources that sort facts from lies are under threat like never before. With the free press and individual journalists increasingly under attack, The Guardian is committed to exposing wrongdoing and uncovering the truth.',
        'We are living in confusing times and understand that it can be tempting to turn away from news coverage. But we hope you feel, as we do, that we have to make sense of the world if we’re going to have a chance of making it a better place. Our approach allows us to keep our factual journalism open to everyone, regardless of where they live or what they can afford. We are so encouraged by the support we have already received from our readers, and we want to say thank you. But we need many more readers to join for each year to come.',
    ],
    highlightedText:
        'By giving a year-end gift – however big or small – you are supporting The Guardian’s independence and ensuring we can keep delivering factual, trustworthy journalism for the years to come. Thank you.',
};

export const acquisitionsEpicUsEndOfYearRound2: EpicABTest = makeABTest({
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
            id: 'control',
            products: [],
        },
        {
            id: 'us_eoy_critical_times_top_ticker',
            products: [],
            options: {
                copy: criticalTimesCopy,
                template: createTemplate('TOP'),
                onInsert: () => {
                    initTicker();
                },
                // TODO remove
                isUnlimited: true,
            },
        },
        {
            id: 'us_eoy_critical_times_bottom_ticker',
            products: [],
            options: {
                copy: criticalTimesCopy,
                template: createTemplate('BOTTOM'),
                onInsert: () => {
                    initTicker();
                },
                // TODO remove
                isUnlimited: true,
            },
        },
        {
            id: 'us_eoy_something_you_can_do_bottom_ticker',
            products: [],
            options: {
                copy: somethingYouCanDoCopy,
                template: createTemplate('BOTTOM'),
                onInsert: () => {
                    initTicker();
                },
                // TODO remove
                isUnlimited: true,
            },
        },
    ],
});
