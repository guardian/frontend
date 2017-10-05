import $ from 'lib/$';
import page from 'lib/page';
import config from 'lib/config';
import detect from 'lib/detect';
import storage from 'lib/storage';
import robust from 'lib/robust';
import some from 'lodash/collections/some';
import every from 'lodash/collections/every';
import map from 'lodash/collections/map';
import contains from 'lodash/collections/contains';
import userPrefs from 'common/modules/user-prefs';
import Id from 'common/modules/identity/api';

let emailShown;
let userListSubsChecked = false;
let userListSubs = [];

function pageHasBlanketBlacklist() {
    // Prevent the blanket emails from ever showing on certain keywords or sections
    return page.keywordExists(['US elections 2016', 'Football']) ||
        config.page.section === 'film' ||
        config.page.seriesId === 'world/series/guardian-morning-briefing';
}

function userHasRemoved(id, formType) {
    const currentListPrefs = userPrefs.get('email-sign-up-' + formType);
    return currentListPrefs && currentListPrefs.indexOf(id) > -1;
}

function userHasSeenThisSession() {
    return !!storage.session.get('email-sign-up-seen');
}

function buildUserSubscriptions(response) {
    if (response && response.status !== 'error' && response.result && response.result.subscriptions) {
        userListSubs = map(response.result.subscriptions, 'listId');
        userListSubsChecked = true;
    }

    return userListSubs;
}

function isParagraph($el) {
    return $el.nodeName && $el.nodeName === 'P';
}

function allowedArticleStructure() {
    const $articleBody = $('.js-article__body');

    if ($articleBody.length) {
        const allArticleEls = $('> *', $articleBody);
        return every([].slice.call(allArticleEls, allArticleEls.length - 2), isParagraph);
    } else {
        return false;
    }
}

const canRunList = {
    theFilmToday() {
        return config.page.section === 'film';
    },
    theFiver() {
        return page.keywordExists(['Football']) && allowedArticleStructure();
    },
    labNotes() {
        return config.page.section === 'science' && config.switches.emailSignupLabNotes;
    },
    euRef() {
        return config.switches.emailSignupEuRef &&
            page.keywordExists(['EU referendum']) &&
            allowedArticleStructure();
    },
    usBriefing() {
        return (config.page.section === 'us-news' && allowedArticleStructure()) ||
            config.page.series === 'Guardian US briefing';
    },
    theGuardianToday() {
        return config.switches.emailInArticleGtoday &&
            !pageHasBlanketBlacklist() &&
            allowedArticleStructure();
    },
    sleevenotes() {
        return config.page.section === "music";
    },
    longReads() {
        return config.page.seriesId === 'news/series/the-long-read';
    },
    bookmarks() {
        return config.page.section === "books";
    },
    greenLight() {
        return config.page.section === "environment";
    }
};

// Public

function setEmailShown(emailName) {
    emailShown = emailName;
}

function getEmailShown() {
    return emailShown;
}

function allEmailCanRun() {
    const browser = detect.getUserAgent.browser, version = detect.getUserAgent.version;

    return !config.page.shouldHideAdverts &&
        !config.page.isSensitive &&
        !config.page.isFront &&
        (config.page.contentId && config.page.contentId.indexOf("email-sign-up") === -1) &&
        config.switches.emailInArticle &&
        storage.session.isAvailable() &&
        !userHasSeenThisSession() &&
        !(browser === 'MSIE' && contains(['7', '8', '9'], version + ''));
}

function getUserEmailSubscriptions() {
    if (userListSubsChecked) {
        return Promise.resolve(userListSubs);
    } else {
        return Id.getUserEmailSignUps()
            .then(buildUserSubscriptions)
            .catch(error => {
                robust.logError('c-email', error);
            });
    }
}

function listCanRun(listConfig) {
    if (listConfig.listName &&
        canRunList[listConfig.listName]() &&
        !contains(userListSubs, listConfig.listId) &&
        !userHasRemoved(listConfig.listId, 'article')) {

        return listConfig;
    }
}

export default {
    setEmailShown,
    getEmailShown,
    allEmailCanRun,
    getUserEmailSubscriptions,
    listCanRun
};
