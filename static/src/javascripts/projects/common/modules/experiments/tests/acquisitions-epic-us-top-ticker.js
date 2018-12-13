// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { acquisitionsEpicUsTickerTemplate } from 'common/modules/commercial/templates/acquisitions-epic-us-ticker';
import type { EpicTemplate } from 'common/modules/commercial/contributions-utilities';
import { initTicker } from 'common/modules/commercial/ticker';
import type { TickerPosition } from 'common/modules/commercial/templates/acquisitions-epic-us-ticker';

const abTestName = 'AcquisitionsEpicUsTopTickerRoundSix';

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

const control: AcquisitionsEpicTemplateCopy = {
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

const outsidePerspective: AcquisitionsEpicTemplateCopy = {
    heading: 'In these critical times &hellip;',
    paragraphs: [
        '&hellip; help us protect independent journalism at a time when factual, trustworthy reporting is under threat by making a year-end gift to support The Guardian. We’re asking our US readers to help us raise one million dollars by the new year so that we can report on the stories that matter in 2019. Small or big, every contribution you give will help us reach our goal.',
        'The Guardian’s editorial independence means that we can pursue difficult investigations, challenging the powerful and holding them to account. No one edits our editor and no one steers our opinion.',
        'In 2018, The Guardian broke the story of Cambridge Analytica’s Facebook data breach; we recorded the human fallout from family separations; we charted the rise of the far right, and documented the growing impact of gun violence on Americans’ lives. We reported daily on climate change as a matter of urgent priority. It was readers’ support that made this work possible.',
        '<div class="contributions__epic__quote">&ldquo;Having an outsider’s perspective on America is refreshing. I like that you are constructive, critical and humorous&hellip; sometimes all in one article. The range of voices in your journalists is engaging and provoking. Your long reads and investigative articles are exceptional. I also like your environmental coverage, the opinions page, your arts page, interviews, and all the odd bits of life that other publications don’t cover. It was time I showed my support for your hard work, providing independent journalism with integrity.&rdquo; – Luke, US 🇺🇸</div>',
        'We’re in this together – with your support we can keep exposing the truth. We hope to pass our goal by early January 2019. We want to say a huge thank you to everyone who has supported The Guardian so far.',
    ],
    highlightedText:
        'Please invest in our independent journalism today by making a year-end gift.',
};
const dialUpHope: AcquisitionsEpicTemplateCopy = {
    heading: 'In these critical times &hellip;',
    paragraphs: [
        '&hellip; help us protect independent journalism at a time when factual, trustworthy reporting is under threat by making a year-end gift to support The Guardian. We’re asking our US readers to help us raise one million dollars by the new year so that we can report on the stories that matter in 2019. Small or big, every contribution you give will help us reach our goal.',
        'The Guardian’s editorial independence means that we can pursue difficult investigations, challenging the powerful and holding them to account. No one edits our editor and no one steers our opinion.',
        'In 2018, The Guardian broke the story of Cambridge Analytica’s Facebook data breach; we recorded the human fallout from family separations; we charted the rise of the far right, and documented the growing impact of gun violence on Americans’ lives. We reported daily on climate change as a matter of urgent priority. It was readers’ support that made this work possible.',
        'As 2019 approaches, we would like to ask for your ongoing support. We believe that independent journalism has the power to drive change and build hope. And there are reasons for hope, from the inspiring wave of youth activism around gun violence to the wins of the #metoo movement; from a new dynamism countering the far-right to the most diverse (and yet still nowhere near diverse enough) Congress in American history that took shape after the recent midterms. People long to feel hopeful again, and rigorous journalism that is empirically sourced and emphatically delivered can be a powerful catalyst for change. ',
        'We’re in this together – with your support we can keep exposing the truth. We hope to pass our goal by early January 2019. We want to say a huge thank you to everyone who has supported The Guardian so far.',
    ],
    highlightedText:
        'Please invest in our independent journalism today by making a year-end gift.',
};
const noteFromRebecca: AcquisitionsEpicTemplateCopy = {
    heading: 'In these critical times &hellip;',
    paragraphs: [
        '&hellip; Guardian columnist and author Rebecca Solnit urges you to show your support for independent journalism with a year-end gift to The Guardian. We are asking our US readers to help us raise  $1 million dollars by the new year to report on the most important stories in 2019. ',
        'A note from Rebecca:',
        '&ldquo;First they came for the journalists,&rdquo; said the young man’s sign. &ldquo;We don’t know what happened after that.&rdquo; It’s a brilliant comment that underscores two things. One is how utterly necessary it is to a free, powerful, informed public, to have the ability to act on what happens beyond our own horizon, to make choices about our governments whether by blockading a senate or parliament or electing people we’ve learned about from the news.',
        'The other is how much tyrants and would-be tyrants fear a free press – and what your enemies think is often the best way to measure whether you matter. They know autocracy depend on keeping the public ignorant on some fronts and misinformed on others. ',
        'We’ve seen direct attacks on journalists in the past year, from the murder of Jamal Khashoggi to Trump’s incessant attacks on the media as &ldquo;the enemy of the people,&rdquo; and for a couple of decades we’ve seen the indirect attacks that are Silicon Valley’s siphoning off of advertising revenue and amplification of untruths for profit.',
        'It costs a lot to send someone out to cover a campaign or to investigate a crime; it’s hard work that requires expertise and support from our readers. This year, The Guardian has covered everything from tech to feminism to Trump to fossil fuel politics. It is our editorial independence that has allowed us to deliver this fearless reporting; an independence that’s sometimes hard to find in other US-based media. We hope you appreciate our efforts.',
        'We want to say a huge thank you to everyone who has supported The Guardian so far. We hope to pass our goal by early January 2019. Every contribution, big or small, will help us reach it.',
    ],
    highlightedText:
        'Please make a year-end gift today to show your ongoing support for our independent journalism. Thank you.',
};
const noteFromJohn: AcquisitionsEpicTemplateCopy = {
    heading: 'In these critical times &hellip;',
    paragraphs: [
        '&hellip; The Guardian’s US editor John Mulholland urges you to show your support for independent journalism with a year-end gift to The Guardian. We are asking our US readers to help us raise $1 million dollars by the new year to report on the most important stories in 2019.',
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
            id: 'control',
            products: [],
            options: {
                copy: control,
                template: createTemplate('TOP'),
                onView: () => {
                    initTicker('.js-epic-ticker');
                },
            },
        },
        {
            id: 'US_EoY_R7_OutsidePT',
            products: [],
            options: {
                copy: outsidePerspective,
                template: createTemplate('TOP'),
                onView: () => {
                    initTicker('.js-epic-ticker');
                },
            },
        },
        {
            id: 'US_EoY_R7_Hope',
            products: [],
            options: {
                copy: dialUpHope,
                template: createTemplate('TOP'),
                onView: () => {
                    initTicker('.js-epic-ticker');
                },
            },
        },
        {
            id: 'US_EoY_R7_Rebecca',
            products: [],
            options: {
                copy: noteFromRebecca,
                template: createTemplate('TOP'),
                onView: () => {
                    initTicker('.js-epic-ticker');
                },
            },
        },
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
