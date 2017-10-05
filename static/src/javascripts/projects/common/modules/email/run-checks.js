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

var emailShown;
var userListSubsChecked = false;
var userListSubs = [];

function pageHasBlanketBlacklist() {
    // Prevent the blanket emails from ever showing on certain keywords or sections
    return page.keywordExists(['US elections 2016', 'Football']) ||
        config.page.section === 'film' ||
        config.page.seriesId === 'world/series/guardian-morning-briefing';
}

function userHasRemoved(id, formType) {
    var currentListPrefs = userPrefs.get('email-sign-up-' + formType);
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
    var $articleBody = $('.js-article__body');

    if ($articleBody.length) {
        var allArticleEls = $('> *', $articleBody);
        return every([].slice.call(allArticleEls, allArticleEls.length - 2), isParagraph);
    } else {
        return false;
    }
}

var canRunList = {
    theFilmToday: function() {
        return config.page.section === 'film';
    },
    theFiver: function() {
        return page.keywordExists(['Football']) && allowedArticleStructure();
    },
    labNotes: function() {
        return config.page.section === 'science' && config.switches.emailSignupLabNotes;
    },
    euRef: function() {
        return config.switches.emailSignupEuRef &&
            page.keywordExists(['EU referendum']) &&
            allowedArticleStructure();
    },
    usBriefing: function() {
        return (config.page.section === 'us-news' && allowedArticleStructure()) ||
            config.page.series === 'Guardian US briefing';
    },
    theGuardianToday: function() {
        return config.switches.emailInArticleGtoday &&
            !pageHasBlanketBlacklist() &&
            allowedArticleStructure();
    },
    sleevenotes: function() {
        return config.page.section === "music";
    },
    longReads: function() {
        return config.page.seriesId === 'news/series/the-long-read';
    },
    bookmarks: function() {
        return config.page.section === "books";
    },
    greenLight: function() {
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
    var browser = detect.getUserAgent.browser,
        version = detect.getUserAgent.version;

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
            .catch(function(error) {
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
    setEmailShown: setEmailShown,
    getEmailShown: getEmailShown,
    allEmailCanRun: allEmailCanRun,
    getUserEmailSubscriptions: getUserEmailSubscriptions,
    listCanRun: listCanRun
};
