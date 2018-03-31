// @flow
import $ from 'lib/$';
import { keywordExists } from 'lib/page';
import config from 'lib/config';
import { getUserAgent } from 'lib/detect';
import { session } from 'lib/storage';
import { logError } from 'lib/robust';
import userPrefs from 'common/modules/user-prefs';
import { getUserEmailSignUps } from 'common/modules/identity/api';

import type bonzo from 'bonzo';
import type { ListConfig } from 'common/modules/email/email-article';

let emailShown;
let userListSubsChecked = false;
let userListSubs = [];

const pageHasBlanketBlacklist = (): boolean =>
    // Prevent the blanket emails from ever showing on certain keywords or sections
    keywordExists(['US elections 2016', 'Football']) ||
    config.get('page.section') === 'film' ||
    config.get('page.seriesId') === 'world/series/guardian-morning-briefing' ||
    config.get('page.pageId') === '/profile/first-dog-on-the-moon'; // temporary to prevent some spammers to annoy us

const userHasRemoved = (id: string, formType: string): boolean => {
    const currentListPrefs = userPrefs.get(`email-sign-up-${formType}`);
    return !!currentListPrefs && currentListPrefs.includes(id);
};

const userHasSeenThisSession = (): boolean =>
    !!session.get('email-sign-up-seen');

const buildUserSubscriptions = (response: Object): Array<string> => {
    if (
        response &&
        response.status !== 'error' &&
        response.result &&
        response.result.subscriptions
    ) {
        userListSubs = response.result.subscriptions.map(sub => sub.listId);
        userListSubsChecked = true;
    }

    return userListSubs;
};

const isParagraph = ($el: bonzo): boolean =>
    !!$el.nodeName && $el.nodeName === 'P';

const allowedArticleStructure = (): boolean => {
    const $articleBody = $('.js-article__body');

    if ($articleBody.length) {
        const allArticleEls = $('> *', $articleBody);

        return Array.from(allArticleEls)
            .slice(allArticleEls.length - 2)
            .every(isParagraph);
    }
    return false;
};

const canRunList = {
    theFilmToday(): boolean {
        return config.get('page.section') === 'film';
    },
    theFiver(): boolean {
        return keywordExists(['Football']) && allowedArticleStructure();
    },
    labNotes(): boolean {
        return (
            config.get('page.section') === 'science' &&
            config.get('switches.emailSignupLabNotes')
        );
    },
    euRef(): boolean {
        return (
            config.get('switches.emailSignupEuRef') &&
            keywordExists(['EU referendum']) &&
            allowedArticleStructure()
        );
    },
    usBriefing(): boolean {
        return (
            (config.get('page.section') === 'us-news' &&
                allowedArticleStructure()) ||
            config.get('page.series') === 'Guardian US briefing'
        );
    },
    theGuardianToday(): boolean {
        return (
            config.get('switches.emailInArticleGtoday') &&
            !pageHasBlanketBlacklist() &&
            allowedArticleStructure()
        );
    },
    sleevenotes(): boolean {
        return config.get('page.section') === 'music';
    },
    longReads(): boolean {
        return config.get('page.seriesId') === 'news/series/the-long-read';
    },
    bookmarks(): boolean {
        return config.get('page.section') === 'books';
    },
    greenLight(): boolean {
        return config.get('page.section') === 'environment';
    },
};

// Public

const setEmailShown = (emailName: string): void => {
    emailShown = emailName;
};

const getEmailShown = (): string => emailShown;

const allEmailCanRun = (): boolean =>
    !config.get('page.shouldHideAdverts') &&
    !config.get('page.isSensitive') &&
    !config.get('page.isFront') &&
    (config.get('page.contentId') &&
        !config.get('page.contentId').includes('email-sign-up')) &&
    config.get('switches.emailInArticle') &&
    !!session.isAvailable() &&
    !userHasSeenThisSession() &&
    typeof getUserAgent === 'object' &&
    !(
        getUserAgent.browser === 'MSIE' &&
        ['7', '8', '9'].includes(getUserAgent.version)
    );

const getUserEmailSubscriptions = (): Promise<?Array<string>> => {
    if (userListSubsChecked) {
        return Promise.resolve(userListSubs);
    }
    return getUserEmailSignUps()
        .then(buildUserSubscriptions)
        .catch(error => {
            logError('c-email', error);
        });
};

const listCanRun = (listConfig: ListConfig): ?ListConfig => {
    if (
        listConfig.listName &&
        canRunList[listConfig.listName]() &&
        !userListSubs.includes(listConfig.listId) &&
        !userHasRemoved(listConfig.listId, 'article')
    ) {
        return listConfig;
    }
};

export {
    setEmailShown,
    getEmailShown,
    allEmailCanRun,
    getUserEmailSubscriptions,
    listCanRun,
};
