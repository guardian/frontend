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
    'lodash/collections/find'
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
    find
) {

    var listConfigs = {
            nhs: {
                listId: '3573',
                canRun: 'nhs',
                campaignCode: '',
                headline: 'NHS',
                description: 'This is the NHS',
                successHeadline: '',
                successDescription: ''
            }
        },
        $articleBody,
        emailInserted = false,
        isParagraph = function ($el) {
            return $el.nodeName && $el.nodeName === 'P';
        },
        listCanRun = function (listConfig) {
            if (canRunList[listConfig.canRun]()) {
                return listConfig;
            }
        },
        addListToPage = function (listConfig) {
            if (listConfig) {
                var iframe = bonzo.create('<iframe src="/email/form/article/' + listConfig.listId + '" height="218px" data-form-title="' + listConfig.headline + '" data-form-description="' + listConfig.description + '" data-form-campaign-code="' + listConfig.campaignCode + '" scrolling="no" seamless frameborder="0" class="iframed--overflow-hidden email-sub__iframe js-email-sub__iframe js-email-sub__iframe--article" data-form-success-desc="' + listConfig.successDescription + '"></iframe>')[0];

                bean.on(iframe, 'load', function () {
                    email.init(iframe);
                });

                fastdom.write(function () {
                    $(iframe).appendTo($articleBody);
                });
            }
        },
        canRunGlobal = {
            cameFromFronts: function () {
                var host = window.location.host,
                    escapedHost = host.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'), // Escape anything that will mess up the regex
                    urlRegex = new RegExp('^https?:\/\/' + escapedHost + '\/(uk\/|us\/|au\/|international\/)?([a-z-])+$', 'gi');

                return urlRegex.test(document.referrer);
            },
            allowedUser: function () {
                var browser = detect.getUserAgent.browser,
                    version = detect.getUserAgent.version;

                return !(browser === 'MSIE' && contains(['7','8','9'], version + ''))
                        && !Id.isUserLoggedIn();
            },
            allowedArticleStructure: function () {
                $articleBody = $('.js-article__body');

                var allArticleEls = $('> *', $articleBody),
                emailAlreadyInArticle = $('js-email-sub__iframe', $articleBody).length > 0,
                lastFiveElsParas = every([].slice.call(allArticleEls, allArticleEls.length - 5), isParagraph);

                return !emailAlreadyInArticle && lastFiveElsParas;
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
            if (!emailInserted && canRunGlobal.cameFromFronts() && canRunGlobal.allowedUser() && canRunGlobal.allowedArticleStructure()) {
                addListToPage(find(listConfigs, listCanRun));
            }
        }
    };
});
