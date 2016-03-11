define([
    'common/utils/$',
    'bean',
    'bonzo',
    'common/modules/identity/api',
    'fastdom',
    'common/modules/email/email',
    'common/utils/detect',
    'lodash/collections/contains',
    'lodash/arrays/intersection',
    'lodash/collections/map',
    'common/utils/config',
    'lodash/collections/every',
    'lodash/collections/find',
    'lodash/collections/some',
    'text!common/views/email/iframe.html',
    'common/utils/template',
    'common/modules/article/space-filler',
    'common/modules/analytics/omniture',
    'common/utils/robust',
    'common/modules/user-prefs',
    'common/utils/storage'
], function (
    $,
    bean,
    bonzo,
    Id,
    fastdom,
    email,
    detect,
    contains,
    intersection,
    map,
    config,
    every,
    find,
    some,
    iframeTemplate,
    template,
    spaceFiller,
    omniture,
    robust,
    userPrefs,
    storage
) {

    var insertBottomOfArticle = function () {
            return function ($iframeEl) {
                $iframeEl.appendTo('.js-article__body');
            };
        },
        listConfigs = {
            theCampaignMinute: {
                listId: '3599',
                listName: 'theCampaignMinute',
                campaignCode: 'the_minute_footer',
                headline: 'Enjoying The Minute?',
                description: 'Sign up and we\'ll send you the Guardian US Campaign Minute, once per day.',
                successHeadline: 'Thank you for signing up to the Guardian US Campaign minute',
                successDescription: 'We will send you the biggest political story lines of the day',
                modClass: 'post-article',
                insertMethod: function () {
                    return function ($iframeEl) {
                        $iframeEl.insertAfter('.js-article__container');
                    };
                }
            },
            theFilmToday: {
                listId: '1950',
                listName: 'theFilmToday',
                campaignCode: 'film_article_signup',
                headline: 'Want the best of Film, direct to your inbox?',
                description: 'Sign up to Film Today and we\'ll deliver to you the latest movie news, blogs, big name interviews, festival coverage, reviews and more.',
                successHeadline: 'Thank you for signing up to Film Today',
                successDescription: 'We will send you our picks of the most important headlines tomorrow afternoon.',
                modClass: 'end-article'
            },
            theFiver: {
                listId: '218',
                listName: 'theFiver',
                campaignCode: 'fiver_article_signup',
                headline: 'Want a football roundup direct to your inbox?',
                description: 'Sign up to the Fiver, our daily email on the world of football',
                successHeadline: 'Thank you for signing up',
                successDescription: 'You\'ll receive the Fiver daily, around 5pm.',
                modClass: 'end-article',
                insertMethod: insertBottomOfArticle
            },
            morningMailUk: {
                listId: '3640',
                listName: 'morningMailUk',
                campaignCode: 'morning_mail_uk_article_signup',
                headline: 'Ever wanted someone to brief you on the day\'s news?',
                description: 'For the next two weeks we\'ll be trialling a new morning briefing email. We\'re collecting feedback - and if we continue the email, you\'ll be among the first to receive it',
                successHeadline: 'Thank you!',
                successDescription: 'We\'ll send you your briefing every morning.',
                modClass: 'end-article',
                insertMethod: insertBottomOfArticle
            },
            morningMailUkSeries: {
                listId: '3640',
                listName: 'morningMailUkSeries',
                campaignCode: 'morning_mail_uk_series_article_signup',
                headline: 'The morning briefing - start the day one step ahead',
                description: 'Sign up and we\'ll give you a leg-up on the day\'s big stories. We\'re collecting feedback for the next two weeks - and if we continue the email, you\'ll be the first to receive it.',
                successHeadline: 'Thank you!',
                successDescription: 'We\'ll send you your briefing every morning.',
                modClass: 'end-article',
                insertMethod: insertBottomOfArticle
            },
            theGuardianToday: {
                listId: (function () {
                    switch (config.page.edition) {
                        default:
                            return '37';

                        case 'US':
                            return '1493';

                        case 'AU':
                            return '1506';
                    }
                }()),
                listName: 'theGuardianToday',
                campaignCode: 'guardian_today_article_bottom',
                headline: 'Want stories like this in your inbox?',
                description: 'Sign up to The Guardian Today daily email and get the biggest headlines each morning.',
                successHeadline: 'Thank you for signing up to the Guardian Today',
                successDescription: 'We will send you our picks of the most important headlines tomorrow morning.',
                modClass: 'end-article',
                insertMethod: insertBottomOfArticle
            }
        },
        emailInserted = false,
        userListSubscriptions = [],
        keywords = config.page.keywords ? config.page.keywords.split(',') : '',
        isParagraph = function ($el) {
            return $el.nodeName && $el.nodeName === 'P';
        },
        getSpacefinderRules = function () {
            return {
                bodySelector: '.js-article__body',
                slotSelector: ' > p',
                minAbove: 200,
                minBelow: 150,
                clearContentMeta: 50,
                fromBottom: true,
                selectors: {
                    ' .element-rich-link': {minAbove: 100, minBelow: 100},
                    ' > h2': {minAbove: 200, minBelow: 0},
                    ' > *:not(p):not(h2):not(blockquote)': {minAbove: 35, minBelow: 200},
                    ' .ad-slot': {minAbove: 150, minBelow: 200}
                }
            };
        },
        buildUserSubscriptions = function (response) {
            if (response && response.status !== 'error' && response.result && response.result.subscriptions) {
                userListSubscriptions = map(response.result.subscriptions, 'listId');
            }

            // Get the first list that is allowed on this page
            addListToPage(find(listConfigs, listCanRun));
        },
        listCanRun = function (listConfig) {
            var browser = detect.getUserAgent.browser,
                version = detect.getUserAgent.version;

            // Check our lists canRun method and
            // make sure that the user isn't already subscribed to this email and
            // don't show on IE 7,8,9 for now
            if (!config.page.shouldHideAdverts &&
                listConfig.listName &&
                canRunList[listConfig.listName]() &&
                !contains(userListSubscriptions, listConfig.listId) &&
                !userHasRemoved(listConfig.listId, 'article') &&
                !(browser === 'MSIE' && contains(['7','8','9'], version + ''))) {
                return listConfig;
            }
        },
        userHasRemoved = function (id, formType) {
            var currentListPrefs = userPrefs.get('email-sign-up-' + formType);
            return currentListPrefs && currentListPrefs.indexOf(id) > -1;
        },
        userHasSeenThisSession = function () {
            return storage.session.get('email-sign-up-seen');
        },
        addListToPage = function (listConfig) {
            if (listConfig) {
                var iframe = bonzo.create(template(iframeTemplate, listConfig))[0],
                    $iframeEl = $(iframe);

                bean.on(iframe, 'load', function () {
                    email.init(iframe);
                });
                if (listConfig.insertMethod && listConfig.insertMethod()) {
                    fastdom.write(function () {
                        listConfig.insertMethod()($iframeEl);

                        omniture.trackLinkImmediate('rtrt | email form inline | article | ' + listConfig.listId + ' | sign-up shown');
                        emailInserted = true;
                    });
                } else {
                    spaceFiller.fillSpace(getSpacefinderRules(), function (paras) {
                        $iframeEl.insertBefore(paras[0]);
                        omniture.trackLinkImmediate('rtrt | email form inline | article | ' + listConfig.listId + ' | sign-up shown');
                        emailInserted = true;
                    });
                }

                storage.session.set('email-sign-up-seen', 'true');
            }
        },
        canRunHelpers = {
            keywordExists: function (keyword) {
                // Compare page keywords with passed in array
                return !!intersection(keywords, keyword).length;
            },
            userReferredFromNetworkFront: function () {
                // Check whether the referring url ends in the edition
                var networkFront = ["uk", "us", "au", "international"],
                    originPathName = document.referrer.split(/\?|#/)[0];

                if (originPathName) {
                    return some(networkFront, function(frontName){
                        return originPathName.substr(originPathName.lastIndexOf("/")+1) === frontName;
                    });
                }

                return false;
            },
            pageHasBlanketBlacklist: function () {
                // Prevent the blanket emails from ever showing on certain keywords or sections
                return canRunHelpers.keywordExists(['US elections 2016', 'Football']) ||
                        config.page.section === 'film' ||
                        config.page.seriesId === 'world/series/guardian-morning-briefing';
            },
            allowedArticleStructure: function () {
                var $articleBody = $('.js-article__body');

                if ($articleBody.length) {
                    var allArticleEls = $('> *', $articleBody);
                    return every([].slice.call(allArticleEls, allArticleEls.length - 3), isParagraph);
                } else {
                    return false;
                }
            }
        },
        canRunList = {
            theCampaignMinute: function () {
                return config.page.isMinuteArticle && canRunHelpers.keywordExists(['US elections 2016']);
            },
            theFilmToday: function () {
                return config.page.section === 'film';
            },
            theFiver: function () {
                return canRunHelpers.keywordExists(['Football']) &&
                        canRunHelpers.allowedArticleStructure();
            },
            morningMailUkSeries: function () {
                return config.page.seriesId === 'world/series/guardian-morning-briefing' &&
                        canRunHelpers.allowedArticleStructure();
            },
            morningMailUk: function () {
                return (config.page.edition === 'UK' || config.page.edition === 'INT') &&
                        !canRunHelpers.pageHasBlanketBlacklist() &&
                        canRunHelpers.userReferredFromNetworkFront() &&
                        canRunHelpers.allowedArticleStructure();
            },
            theGuardianToday: function () {
                return !canRunHelpers.pageHasBlanketBlacklist() &&
                        canRunHelpers.userReferredFromNetworkFront() &&
                        canRunHelpers.allowedArticleStructure();
            }
        };

    return {
        init: function () {
            if (!emailInserted &&
                !config.page.isFront &&
                config.switches.emailInArticle &&
                storage.session.isAvailable &&
                !userHasSeenThisSession()) {
                // Get the user's current subscriptions
                Id.getUserEmailSignUps()
                    .then(buildUserSubscriptions)
                    .catch(function (error) {
                        robust.log('c-email', error);
                    });
            }
        }
    };
});
