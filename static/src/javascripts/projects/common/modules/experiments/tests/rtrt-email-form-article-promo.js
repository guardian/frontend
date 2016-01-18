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
    'lodash/collections/every'
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
    every
) {
    return function () {
        this.id = 'RtrtEmailFormArticlePromoV2';
        this.start = '2015-12-17';
        this.expiry = '2016-02-03';
        this.author = 'Gareth Trufitt';
        this.description = 'Test promotion of email form at bottom vs three paragraphs from end of article pages (when clicked from front)';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Increase email sign-up numbers';
        this.audienceCriteria = 'Visitors hitting articles after visiting a front';
        this.dataLinkNames = '';
        this.idealOutcome = 'Email sign-up is increased';

        var $articleBody = $('.js-article__body'),
            isParagraph = function ($el) {
                return $el.nodeName && $el.nodeName === 'P';
            };

        this.canRun = function () {
            //Tests for fronts, editions optional.
            var host = window.location.host,
                escapedHost = host.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'), // Escape anything that will mess up the regex
                urlRegex = new RegExp('^https?:\/\/' + escapedHost + '\/(uk\/|us\/|au\/|international\/)?([a-z-])+$', 'gi'),
                browser = detect.getUserAgent.browser,
                version = detect.getUserAgent.version,
                allArticleEls = $('> *', $articleBody),
                lastFiveElsParas = every([].slice.call(allArticleEls, allArticleEls.length - 5), isParagraph);

            // User referred from a front, is not logged in and not lte IE9
            return lastFiveElsParas && urlRegex.test(document.referrer) && !Id.isUserLoggedIn() && !(browser === 'MSIE' && contains(['7','8','9'], version + ''));
        };

        function injectEmailForm($position, typeOfInsert) {
            var listId,
                iframe;

            switch (config.page.edition) {
                case 'UK':
                    listId = '37';
                    break;

                case 'US':
                    listId = '1493';
                    break;

                case 'AU':
                    listId = '1506';
                    break;

                case 'INT':
                    listId = '37';
                    break;
            }

            iframe = bonzo.create('<iframe src="/email/form/article/' + listId + '" height="218px" data-form-title="Want stories like this in your inbox?" data-form-description="Sign up to The Guardian Today daily email and get the biggest headlines each morning." data-form-campaign-code="frontReferredTest" scrolling="no" seamless frameborder="0" class="iframed--overflow-hidden email-sub__iframe js-email-sub__iframe js-email-sub__iframe--article" data-form-success-desc="We will send you our picks of the most important headlines tomorrow morning."></iframe>')[0];

            bean.on(iframe, 'load', function () {
                email.init(iframe);
            });

            fastdom.write(function () {
                $(iframe)[typeOfInsert || 'appendTo']($position);
            });
        }

        this.variants = [
            {
                id: 'bottom-of-page',
                test: function () {
                    injectEmailForm($articleBody);
                }
            },
            {
                id: 'three-paras-from-bottom',
                test: function () {
                    var articleParas = $('> p', $articleBody),
                        para = $(articleParas[articleParas.length - 3]); // This is a little bit heavy handed but should be ok for test.

                    injectEmailForm(para, 'insertBefore');
                }
            }
        ];
    };
});
