define([
    'common/utils/$',
    'bean',
    'bonzo',
    'common/modules/identity/api',
    'fastdom',
    'common/modules/email/email',
    'common/utils/detect',
    'lodash/collections/contains',
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
    config,
    every,
    find,
    iframeTemplate,
    template
) {

    var listConfigs = {
            nhs: {
                listId: '3573',
                canRun: 'nhs',
                campaignCode: 'NHS_in_article',
                headline: 'Interested in the NHS?',
                description: 'Sign up to email updates related to the Guardian\'s coverage of the NHS, including daily updates as the project develops',
                successHeadline: 'Thank you for signing up to our NHS email updates',
                successDescription: 'You\'ll receive daily updates in your inbox'
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
            }
        },
        $articleBody,
        emailInserted = false,
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
                    $iframeEl[listConfig.insertMethod || 'appendTo']($insertEl.length > 0 ? $insertEl : $articleBody);
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
                var keywords = config.page.keywords ? config.page.keywords.split(',') : '';
                return contains(keywords, keyword)
            }
        },
        canRunList = {
            nhs: function () {
                return canRunHelpers.allowedArticleStructure() && canRunHelpers.keywordExists('NHS');
            },
            theCampaignMinute: function () {
                return config.page.isMinuteArticle && canRunHelpers.keywordExists('US elections 2016')
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
