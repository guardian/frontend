// @flow
import $ from 'lib/$';
import { keywordExists } from 'lib/page';
import config from 'lib/config';
import { getUserAgent } from 'lib/detect';
import { session } from 'lib/storage';
import { logError } from 'lib/robust';
import userPrefs from 'common/modules/user-prefs';
import { getUserEmailSignUps } from 'common/modules/identity/api';

let emailShown;
let userListSubsChecked = false;
let userListSubs = [];

const pageHasBlanketBlacklist = () =>
    // Prevent the blanket emails from ever showing on certain keywords or sections
    keywordExists(['US elections 2016', 'Football']) ||
    config.get('page.section') === 'film' ||
    config.get('page.seriesId') === 'world/series/guardian-morning-briefing';

const userHasRemoved = (id, formType) => {
    const currentListPrefs = userPrefs.get(`email-sign-up-${formType}`);
    return currentListPrefs && currentListPrefs.indexOf(id) > -1;
};

const userHasSeenThisSession = () => !!session.get('email-sign-up-seen');

const buildUserSubscriptions = response => {
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

const isParagraph = $el => $el.nodeName && $el.nodeName === 'P';

const allowedArticleStructure = () => {
    const $articleBody = $('.js-article__body');

    if ($articleBody.length) {
        const allArticleEls = $('> *', $articleBody);

        return [].slice
            .call(allArticleEls, allArticleEls.length - 2)
            .every(isParagraph);
    }
    return false;
};

const canRunList = {
    theFilmToday() {
        return config.get('page.section') === 'film';
    },
    theFiver() {
        return keywordExists(['Football']) && allowedArticleStructure();
    },
    labNotes() {
        return (
            config.get('page.section') === 'science' &&
            config.get('switches.emailSignupLabNotes')
        );
    },
    euRef() {
        return (
            config.get('switches.emailSignupEuRef') &&
            keywordExists(['EU referendum']) &&
            allowedArticleStructure()
        );
    },
    usBriefing() {
        return (
            (config.get('page.section') === 'us-news' &&
                allowedArticleStructure()) ||
            config.get('page.series') === 'Guardian US briefing'
        );
    },
    theGuardianToday() {
        return (
            config.get('switches.emailInArticleGtoday') &&
            !pageHasBlanketBlacklist() &&
            allowedArticleStructure()
        );
    },
    sleevenotes() {
        return config.get('page.section') === 'music';
    },
    longReads() {
        return config.get('page.seriesId') === 'news/series/the-long-read';
    },
    bookmarks() {
        return config.get('page.section') === 'books';
    },
    greenLight() {
        return config.get('page.section') === 'environment';
    },
};

// Public

const setEmailShown = emailName => {
    emailShown = emailName;
};

const getEmailShown = () => emailShown;

const allEmailCanRun = () =>
    !config.get('page.shouldHideAdverts') &&
    !config.get('page.isSensitive') &&
    !config.get('page.isFront') &&
    (config.get('page.contentId') &&
        config.get('page.contentId').indexOf('email-sign-up') === -1) &&
    config.get('switches.emailInArticle') &&
    session.isAvailable() &&
    !userHasSeenThisSession() &&
    typeof getUserAgent === 'object' &&
    !(
        getUserAgent.browser === 'MSIE' &&
        ['7', '8', '9'].includes(getUserAgent.version)
    );

const getUserEmailSubscriptions = () => {
    if (userListSubsChecked) {
        return Promise.resolve(userListSubs);
    }
    return getUserEmailSignUps()
        .then(buildUserSubscriptions)
        .catch(error => {
            logError('c-email', error);
        });
};

const listCanRun = listConfig => {
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
