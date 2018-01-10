// @flow
import $ from 'lib/$';
import bean from 'bean';
import bonzo from 'bonzo';
import fastdom from 'fastdom';
import { initEmail } from 'common/modules/email/email';
import config from 'lib/config';
import iframeTemplate from 'raw-loader!common/views/email/iframe.html';
import template from 'lodash/utilities/template';
import { spaceFiller } from 'common/modules/article/space-filler';
import { logError } from 'lib/robust';
import {
    listCanRun,
    getUserEmailSubscriptions,
    setEmailShown,
} from 'common/modules/email/run-checks';
import { session } from 'lib/storage';
import { waitForCheck } from 'common/modules/check-mediator';

import type { SpacefinderRules } from 'common/modules/spacefinder.js';

export type ListConfig = {
    listName: string,
    identityListName: string,
    campaignCode: string,
    displayName: {
        normalText: string,
        accentedText: string,
    },
    headline: string,
    description: string,
    successDescription: string,
    insertMethod: bonzo => void,
    successEventName?: string,
};

type ListConfigs = {
    [key: string]: ListConfig,
};

const insertBottomOfArticle = ($iframeEl: bonzo): void => {
    fastdom.write(() => $iframeEl.prependTo('.content-footer'));
};

const listConfigs: ListConfigs = {
    /* The difference between listName and identityListName:
     listName is a reference used in the javascript for legacy reasons where as the identityListName is is the name stored in the identity model and used in the backend. */
    theFilmToday: {
        listName: 'theFilmToday',
        identityListName: 'film-today',
        campaignCode: 'film_article_signup',
        displayName: {
            normalText: 'film',
            accentedText: 'today',
        },
        headline: 'Film Today: now booking',
        description:
            'Sign up to the Guardian Film Today email and we’ll make sure you don’t miss a thing &ndash; the day’s insider news and our latest reviews, plus big name interviews and film festival coverage.',
        successDescription:
            'You’ll receive an email every afternoon after you have clicked the link in the confirmation mail.',
        insertMethod: insertBottomOfArticle,
    },
    theFiver: {
        listName: 'theFiver',
        identityListName: 'the-fiver',
        campaignCode: 'fiver_article_signup',
        displayName: {
            normalText: 'the',
            accentedText: 'fiver',
        },
        headline: 'Kick off your evenings with our football roundup',
        description:
            'Sign up to the Fiver, our daily email on the world of football. We’ll deliver the day’s news and gossip in our own belligerent, sometimes intelligent and &ndash; very occasionally &ndash; funny way.',
        successDescription:
            'You’ll receive the Fiver daily around 5pm after you have clicked the link in the confirmation mail.',
        insertMethod: insertBottomOfArticle,
    },
    labNotes: {
        listName: 'labNotes',
        identityListName: 'lab-notes',
        campaignCode: 'lab_notes_article_signup',
        displayName: {
            normalText: 'lab',
            accentedText: 'notes',
        },
        headline: 'Science news you’ll want to read. Fact.',
        description:
            'Sign up to Lab Notes and we’ll email you the top stories in science, from medical breakthroughs to dinosaur discoveries &ndash; plus brainteasers, podcasts and more.',
        successDescription:
            'You’ll receive an email every week after you have clicked the link in the confirmation mail.',
        insertMethod: insertBottomOfArticle,
    },
    euRef: {
        listName: 'euRef',
        identityListName: 'brexit-briefing',
        campaignCode: 'eu_ref_article_signup',
        displayName: {
            normalText: 'brexit',
            accentedText: 'briefing',
        },
        headline: 'Brexit: your weekly briefing',
        description:
            'Sign up and we’ll email you the key developments and most important debates as Britain takes its first steps on the long road to leaving the EU.',
        successDescription:
            'You’ll receive an email every morning after you have clicked the link in the confirmation mail.',
        insertMethod: insertBottomOfArticle,
    },
    usBriefing: {
        listName: 'usBriefing',
        identityListName: 'today-us',
        campaignCode: 'guardian_today_article_bottom',
        displayName: {
            normalText: 'us',
            accentedText: 'briefing',
        },
        headline: 'Want stories like this in your inbox?',
        description:
            'Sign up to the Guardian US briefing to get the top stories in your inbox every weekday.',
        successDescription:
            'We will send you our pick of the most important stories after you have clicked the link in the confirmation mail',
        insertMethod: insertBottomOfArticle,
    },
    sleevenotes: {
        listName: 'sleevenotes',
        identityListName: 'sleeve-notes',
        campaignCode: 'sleevenotes_article_bottom',
        displayName: {
            normalText: 'sleeve',
            accentedText: 'notes',
        },
        headline: 'Sleeve notes: sounds good',
        description:
            'Get music news, bold reviews and unexpected extras emailed direct to you from the Guardian’s music desk every Friday.',
        successDescription:
            'You’ll receive an email every Friday after you have clicked the link in the confirmation mail',
        insertMethod: insertBottomOfArticle,
    },
    longReads: {
        listName: 'longReads',
        identityListName: 'the-long-read',
        campaignCode: 'long_reads_article_bottom',
        displayName: {
            normalText: 'long',
            accentedText: 'reads',
        },
        headline: 'Here’s the real story',
        description:
            'Lose yourself in a great story. From politics to psychology, food to technology, culture to crime – the best stories, the biggest ideas, the arguments that matter.',
        successDescription:
            'You’ll receive an email every weekend after you have clicked the link in the confirmation mail',
        insertMethod: insertBottomOfArticle,
    },
    bookmarks: {
        listName: 'bookmarks',
        identityListName: 'bookmarks',
        campaignCode: 'bookmarks_article_bottom',
        displayName: {
            normalText: 'book',
            accentedText: 'marks',
        },
        headline: 'Bookmarks: read me first',
        description:
            'Sign up for our weekly email for book lovers and discover top 10s, expert book reviews, author interviews, and enjoy highlights from our columnists and community every weekend.',
        successDescription:
            'You’ll receive an email every weekend after you have clicked the link in the confirmation mail',
        insertMethod: insertBottomOfArticle,
    },
    greenLight: {
        listName: 'greenLight',
        identityListName: 'green-light',
        campaignCode: 'green_light_article_bottom',
        displayName: {
            normalText: 'green',
            accentedText: 'light',
        },
        headline: 'The most important stories on the planet',
        description:
            'Sign up to Green Light for environment news emailed direct to you every Friday. And besides the week’s biggest stories and debates, you can expect beautifully curated wildlife galleries, absorbing podcasts and eco-living guides.',
        successDescription:
            'You’ll receive an email every Friday after you have clicked the link in the confirmation mail',
        insertMethod: insertBottomOfArticle,
    },
    theGuardianToday: {
        listName: 'theGuardianToday',
        identityListName: (() => {
            switch (config.get('page.edition')) {
                default:
                    return 'today-uk';

                case 'US':
                    return 'today-us';

                case 'AU':
                    return 'today-au';
            }
        })(),
        campaignCode: 'guardian_today_article_bottom',
        displayName: {
            normalText: 'theguardian',
            accentedText: 'today',
        },
        headline: 'The headlines, the analysis, the debate',
        description:
            'Get the whole picture from a source you trust, emailed to you every morning. The biggest stories examined, and diverse, independent views &ndash; the Guardian Today delivers the best of our journalism.',
        successDescription:
            'We will send you our picks of the most important headlines tomorrow morning after you have clicked the link in the confirmation mail',
        insertMethod: insertBottomOfArticle,
    },
};

const spacefinderRules: SpacefinderRules = {
    bodySelector: '.js-article__body',
    slotSelector: ' > p',
    minAbove: 200,
    minBelow: 150,
    clearContentMeta: 50,
    fromBottom: true,

    selectors: {
        ' .element-rich-link': {
            minAbove: 100,
            minBelow: 100,
        },
        ' > h2': {
            minAbove: 200,
            minBelow: 0,
        },
        ' > *:not(p):not(h2):not(blockquote)': {
            minAbove: 35,
            minBelow: 200,
        },
        ' .ad-slot': {
            minAbove: 150,
            minBelow: 200,
        },
    },
};

const addListToPage = (
    listConfig: ListConfig,
    successEventName: string = ''
): void => {
    const iframe = bonzo.create(
        template(iframeTemplate, { ...listConfig, ...{ successEventName } })
    )[0];
    const $iframeEl = $(iframe);
    const onEmailAdded = () => {
        setEmailShown(listConfig.listName);
        session.set('email-sign-up-seen', 'true');
    };

    bean.on(iframe, 'load', () => {
        initEmail(iframe);
    });

    if (listConfig.insertMethod) {
        fastdom.write(() => {
            listConfig.insertMethod($iframeEl);
            onEmailAdded();
        });
    } else {
        spaceFiller.fillSpace(spacefinderRules, paras => {
            $iframeEl.insertBefore(paras[0]);
            onEmailAdded();
        });
    }
};

const init = (): void => {
    waitForCheck('emailCanRun')
        .then(emailCanRun => {
            if (emailCanRun) {
                waitForCheck('emailCanRunPostCheck').then(
                    emailCanRunPostCheck => {
                        if (emailCanRunPostCheck) {
                            getUserEmailSubscriptions()
                                .then(() => {
                                    const listConfig = Object.keys(
                                        listConfigs
                                    ).find(key => listCanRun(listConfigs[key]));
                                    if (listConfig) {
                                        addListToPage(listConfigs[listConfig]);
                                    }
                                })
                                .catch(error => {
                                    logError('c-email', error);
                                });
                        }
                    }
                );
            }
        })
        .catch(error => {
            logError('check-mediator', error);
        });
};

const getListConfigs = (): ListConfigs => listConfigs;

export { init, getListConfigs };
