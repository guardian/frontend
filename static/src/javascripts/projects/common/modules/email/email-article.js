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
    'template!common/views/email/iframe.html'
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
    iframeTemplate
) {

    var listConfigs = {
            nhs: {
                listId: '3573',
                canRun: 'nhs',
                campaignCode: 'NHS_in_article',
                headline: 'Interested in the NHS?',
                description: 'Sign up to email updates related to the Guardian\'s coverage of the NHS, including daily updates as the project develops',
                successHeadline: 'Thank you for signing up to our NHS email updates',
                successDescription: 'You\'ll receive daily updates in your inbox',
                modClass: 'end-article'
            },
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
                var iframe = bonzo.create(iframeTemplate(listConfig))[0],
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
            nhs: function () {
                return canRunHelpers.allowedArticleStructure() && canRunHelpers.keywordExists(['NHS']);
            },
            theCampaignMinute: function () {
                return config.page.isMinuteArticle && canRunHelpers.keywordExists(['US elections 2016']);
            },
            theGuardianToday: function () {
                var host = window.location.host,
                    escapedHost = host.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'), // Escape anything that will mess up the regex
                    urlRegex = new RegExp('^https?:\/\/' + escapedHost + '\/(uk\/|us\/|au\/|international\/)?([a-z-])+$', 'gi'),
                    browser = detect.getUserAgent.browser,
                    version = detect.getUserAgent.version,
                    pageIsBlacklisted = canRunHelpers.keywordExists(['NHS', 'US elections 2016']);

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
