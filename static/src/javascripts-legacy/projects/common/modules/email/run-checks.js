define([
    'common/utils/$',
    'common/utils/page',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/robust',
    'common/utils/check-mediator',
    'lodash/collections/some',
    'lodash/collections/every',
    'lodash/collections/map',
    'lodash/collections/contains',
    'common/modules/user-prefs',
    'common/modules/identity/api',
    'common/modules/experiments/ab-test-clash',
    'Promise'
], function (
    $,
    page,
    config,
    detect,
    storage,
    robust,
    checkMediator,
    some,
    every,
    map,
    contains,
    userPrefs,
    Id,
    clash,
    Promise
) {
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

    function userReferredFromNetworkFront() {
        // Check whether the referring url ends in the edition
        var networkFront = ['uk', 'us', 'au', 'international'],
            originPathName = document.referrer.split(/\?|#/)[0];

        if (originPathName) {
            return some(networkFront, function (frontName) {
                return originPathName.substr(originPathName.lastIndexOf('/') + 1) === frontName;
            });
        }

        return false;
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
        theCampaignMinute: function () {
            var isUSElection = page.keywordExists(['US elections 2016']);
            var isNotUSBriefingSeries = config.page.series !== 'Guardian US briefing';
            return isUSElection && isNotUSBriefingSeries;
        },
        theFilmToday: function () {
            return config.page.section === 'film';
        },
        theFiver: function () {
            return page.keywordExists(['Football']) && allowedArticleStructure();
        },
        labNotes: function () {
            return config.page.section === 'science' && config.switches.emailSignupLabNotes;
        },
        euRef: function () {
            return config.switches.emailSignupEuRef &&
                    page.keywordExists(['EU referendum']) &&
                    allowedArticleStructure();
        },
        usBriefing: function () {
            return (config.page.section === 'us-news' && allowedArticleStructure()) ||
                config.page.series === 'Guardian US briefing';
        },
        theGuardianToday: function () {
            return config.switches.emailInArticleGtoday &&
                !pageHasBlanketBlacklist() &&
                userReferredFromNetworkFront() &&
                allowedArticleStructure();
        }
    };

    // Public
    function setCompliantOutbrain() {
        compliantOutbrain = true;
    }

    function setEmailShown(emailName) {
        emailShown = emailName;
    }

    function getEmailShown() {
        return emailShown;
    }

    function allEmailCanRun() {
        var browser = detect.getUserAgent.browser,
            version = detect.getUserAgent.version,
            emailCanRun = !config.page.shouldHideAdverts &&
                        !config.page.isSensitive &&
                        !config.page.isFront &&
                        config.switches.emailInArticle &&
                        !clash.userIsInAClashingAbTest(clash.nonEmailClashingTests) &&
                        storage.session.isAvailable() &&
                        !userHasSeenThisSession() &&
                        !(browser === 'MSIE' && contains(['7','8','9'], version + ''));

        if (!emailCanRun) {
            checkMediator.resolveCheck('isEmailInserted', false);
        }

        return emailCanRun;
    }

    function getUserEmailSubscriptions() {
        if (userListSubsChecked) {
            return Promise.resolve(userListSubs);
        } else {
            return Id.getUserEmailSignUps()
                .then(buildUserSubscriptions)
                .catch(function (error) {
                    robust.log('c-email', error);
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

    return {
        setCompliantOutbrain: setCompliantOutbrain,
        setEmailShown: setEmailShown,
        getEmailShown: getEmailShown,
        allEmailCanRun: allEmailCanRun,
        getUserEmailSubscriptions: getUserEmailSubscriptions,
        listCanRun: listCanRun
    };
});
