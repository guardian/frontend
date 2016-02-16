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
    'common/utils/config',
    'lodash/collections/every',
    'lodash/collections/find',
    'text!common/views/email/iframe.html',
    'common/utils/template'
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
    config,
    every,
    find,
    iframeTemplate,
    template
) {

    var listConfigs = {
            theCampaignMinute: {
                listId: '3599',
                canRun: 'theCampaignMinute',
                campaignCode: 'the_minute_footer',
                headline: 'Enjoying The Minute?',
                description: 'Sign up and we\'ll send you the Guardian US Campaign Minute, once per day.',
                successHeadline: 'Thank you for signing up to the Guardian US Campaign minute',
                successDescription: 'We will send you the biggest political story lines of the day',
                modClass: 'post-article',
                insertMethod: 'insertAfter',
                insertSelector: '.js-article__container'
            },
            theFilmToday: {
                listId: '1950',
                canRun: 'theFilmToday',
                campaignCode: 'film_article_signup',
                headline: 'Want the best of Film, direct to your inbox?',
                description: 'Sign up to Film Today and we\'ll deliver to you the latest movie news, blogs, big name interviews, festival coverage, reviews and more.',
                successHeadline: 'Thank you for signing up to Film Today',
                successDescription: 'We will send you our picks of the most important headlines tomorrow afternoon.',
                modClass: 'end-article'
            },
            theFiver: {
                listId: '218',
                canRun: 'theFiver',
                campaignCode: 'fiver_article_signup',
                headline: 'Want a football roundup direct to your inbox?',
                description: 'Sign up to the Fiver, our daily email on the world of football',
                successHeadline: 'Thank you for signing up',
                successDescription: 'You\'ll receive the Fiver daily, around 5pm.',
                modClass: 'end-article'
            },
            theGuardianToday: {
                listId: (function () {
                    switch (config.page.edition) {
                        case 'UK':
                        case 'INT':
                        default:
                            return '37';

                        case 'US':
                            return '1493';

                        case 'AU':
                            return '1506';
                    }
                }()),
                canRun: 'theGuardianToday',
                campaignCode: 'guardian_today_article_bottom',
                headline: 'Want stories like this in your inbox?',
                description: 'Sign up to The Guardian Today daily email and get the biggest headlines each morning.',
                successHeadline: 'Thank you for signing up to the Guardian Today',
                successDescription: 'We will send you our picks of the most important headlines tomorrow morning.',
                modClass: 'end-article'
            }
        },
        $articleBody,
        emailInserted = false,
        keywords = config.page.keywords ? config.page.keywords.split(',') : '',
        isParagraph = function ($el) {
            return $el.nodeName && $el.nodeName === 'P';
        },
        listCanRun = function (listConfig) {
            if (listConfig.canRun && canRunList[listConfig.canRun]()) {
                return listConfig;
            }
        },
        addListToPage = function (listConfig) {
            if (listConfig) {
                var iframe = bonzo.create(template(iframeTemplate, listConfig))[0],
                    $iframeEl = $(iframe),
                    $insertEl = $(listConfig.insertSelector);

                bean.on(iframe, 'load', function () {
                    email.init(iframe);
                });

                fastdom.write(function () {
                    $iframeEl[listConfig.insertMethod || 'appendTo']($insertEl && $insertEl.length > 0 ? $insertEl : $articleBody);
                });

                emailInserted = true;
            }
        },
        canRunHelpers = {
            allowedArticleStructure: function () {
                $articleBody = $('.js-article__body');

                if ($articleBody.length) {
                    var allArticleEls = $('> *', $articleBody),
                        emailAlreadyInArticle = $('js-email-sub__iframe', $articleBody).length > 0,
                        lastFiveElsParas = every([].slice.call(allArticleEls, allArticleEls.length - 5), isParagraph);

                    return !emailAlreadyInArticle && lastFiveElsParas;
                } else {
                    return false;
                }
            },
            keywordExists: function (keyword) {
                // Compare page keywords with passed in array
                return !!intersection(keywords, keyword).length;
            }
        },
        canRunList = {
            theCampaignMinute: function () {
                return config.page.isMinuteArticle && canRunHelpers.keywordExists(['US elections 2016']);
            },
            theFilmToday: function () {
                return config.page.section === 'film' && canRunHelpers.allowedArticleStructure();
            },
            theFiver: function () {
                return canRunHelpers.keywordExists(['Football']) && canRunHelpers.allowedArticleStructure();
            },
            theGuardianToday: function () {
                var host = window.location.host,
                    escapedHost = host.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'), // Escape anything that will mess up the regex
                    urlRegex = new RegExp('^https?:\/\/' + escapedHost + '\/(uk\/|us\/|au\/|international\/)?([a-z-])+$', 'gi'),
                    browser = detect.getUserAgent.browser,
                    version = detect.getUserAgent.version,
                    pageIsBlacklisted = canRunHelpers.keywordExists(['US elections 2016', 'Football']) || config.page.section === 'film';

                return !pageIsBlacklisted &&
                        canRunHelpers.allowedArticleStructure() &&
                        urlRegex.test(document.referrer) &&
                        !Id.isUserLoggedIn() &&
                        !(browser === 'MSIE' && contains(['7','8','9'], version + ''));
            }
        };

    return {
        init: function () {
            if (!emailInserted) {
                // Get the first list that is allowed on this page
                addListToPage(find(listConfigs, listCanRun));
            }
        }
    };
});
