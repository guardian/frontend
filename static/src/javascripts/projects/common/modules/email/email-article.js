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
                var iframe = bonzo.create(template(iframeTemplate, listConfig))[0];

                bean.on(iframe, 'load', function () {
                    email.init(iframe);
                });

                fastdom.write(function () {
                    $(iframe).appendTo($articleBody);
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
            }
        },
        canRunList = {
            nhs: function () {
                var keywords = config.page.keywords ? config.page.keywords.split(',') : '';
                return contains(keywords, 'NHS');
            }
        };

    return {
        init: function () {
            if (!emailInserted && canRunHelpers.allowedArticleStructure()) {
                // Get the first list that is allowed on this page
                addListToPage(find(listConfigs, listCanRun));
            }
        }
    };
});
