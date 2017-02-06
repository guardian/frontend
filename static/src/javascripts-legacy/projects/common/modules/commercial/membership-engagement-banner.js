define([
        'bean',
        'common/utils/$',
        'common/utils/config',
        'common/utils/storage',
        'common/utils/template',
        'common/modules/ui/message',
        'text!common/views/membership-message.html',
        'common/modules/commercial/commercial-features',
        'common/modules/commercial/user-features',
        'common/utils/mediator',
        'Promise',
        'common/utils/fastdom-promise',
        'common/modules/experiments/ab',
        'common/modules/experiments/tests/membership-engagement-banner-tests',
        'lodash/objects/defaults',
        'lodash/collections/find',
        'common/views/svg',
        'inlineSvg!svgs/icon/arrow-white-right.svg',
        'common/utils/fetch'
    ], function (bean,
                 $,
                 config,
                 storage,
                 template,
                 Message,
                 messageTemplate,
                 commercialFeatures,
                 userFeatures,
                 mediator,
                 Promise,
                 fastdom,
                 ab,
                 MembershipEngagementBannerTests,
                 defaults,
                 find,
                 svg,
                 arrowWhiteRight,
                 fetch) {


        // change messageCode to force redisplay of the message to users who already closed it.
        // messageCode is also consumed by .../test/javascripts/spec/common/commercial/membership-engagement-banner.spec.js
        var messageCode = 'engagement-banner-2017-01-11';

        //Remind me form selectors
        var SECONDARY_BUTTON = '.secondary';
        var REMIND_ME_FORM = '.membership__remind-me-form';
        var REMIND_ME_TEXT_FIELD = '.membership__engagement-text-field';
        var REMIND_ME_CTA = '.membership__remind-me-form__cta';
        var REMIND_ME_THANKS_MESSAGE = '.membership__remind-me-form__thanks-message';
        var REMIND_ME_ERROR = '.membership__remind-me-form__error';

        var LIST_ID = 3813;
        var EMAIL_PATH = '/email';

        var baseParams = {
            minArticles: 3,
            colourStrategy: function() {
                return 'membership-prominent ' + selectSequentiallyFrom(['yellow', 'purple', 'bright-blue', 'dark-blue']);
            }
        };

        var offeringParams = {
            membership: {
                buttonCaption: 'Become a Supporter',
                linkUrl: 'https://membership.theguardian.com/supporter'
            },
            contributions: {
                buttonCaption: 'Make a Contribution',
                linkUrl: 'https://contribute.theguardian.com/'
            }
        };

        var editionParams = {
            UK: {
                membership: {
                    messageText: 'For less than the price of a coffee a week, you could help secure the Guardian’s future. Support our journalism for £5 a month.',
                    campaignCode: "mem_uk_banner"
                }
            },
            US: {
                contributions: {
                    messageText: 'If you use it, if you like it, then why not pay for it? It’s only fair.',
                    campaignCode: "cont_us_banner"
                }
            },
            AU: {
                membership: {
                    messageText: 'We need you to help support our fearless independent journalism. Become a Guardian Australia member for just $10 a month.',
                    campaignCode: "mem_au_banner"
                }
            },
            INT: {
                membership: {
                    messageText: 'For less than the price of a coffee a week, you could help secure the Guardian\'s future. Support our journalism for $7 / €5 a month.',
                    campaignCode: "mem_int_banner"
                }
            }
        };

        /*
         * Params for the banner are overlaid in this order, earliest taking precedence:
         *
         *  * Variant (if the user is in an A/B testing variant)
         *  * Edition
         *  * Offering ('membership' or 'contributions')
         *  * Default
         *
         * The 'offering' in use comes from either:
         *
         *  * Variant (if the user is in an A/B testing variant)
         *  * Edition (only one offering can be the default for a given Edition)
         *
         * Returns either 'null' if no banner is available for this edition,
         * otherwise a populated params object that looks like this:
         *
         *  {
         *    minArticles: 5, // how many articles should the user see before they get the engagement banner?
         *    messageText: "..."
         *    colourStrategy: // a function to determine what css class to use for the banner's colour
         *    buttonCaption: "Become a Supporter"
         *  }
         *
         */
        function deriveBannerParams() {
            var paramsByOfferingForUserEdition = editionParams[config.page.edition];

            var engagementBannerTest = find(MembershipEngagementBannerTests, function(test) {
                return ab.testCanBeRun(test)
            });

            var userVariant = engagementBannerTest ? find(engagementBannerTest.variants, function(variant) {
                return variant.id == ab.getTestVariantId(engagementBannerTest.id);
            }) : undefined;

            // offering = 'membership' or 'contributions'
            var offering = Object.keys(userVariant?userVariant.params:paramsByOfferingForUserEdition)[0];

            var bannerParamsSources =
                [baseParams, offeringParams[offering], paramsByOfferingForUserEdition[offering]];

            if (userVariant) {
                bannerParamsSources.push(userVariant.params[offering]);
            }

            bannerParamsSources.push({}); // Will be mutated by 'defaults': https://lodash.com/docs/4.17.2#defaults

            var mergedParams = defaults.apply(this, bannerParamsSources.reverse());
            return mergedParams;
        }


        function showBanner(params) {
            var colourClass = params.colourStrategy();

            var messageText = Array.isArray(params.messageText)?selectSequentiallyFrom(params.messageText):params.messageText;

            var renderedBanner = template(messageTemplate, {
                linkHref: params.linkUrl + '?INTCMP=' + params.campaignCode,
                messageText: messageText,
                buttonCaption: params.buttonCaption,
                colourClass: colourClass,
                arrowWhiteRight: svg(arrowWhiteRight),
                showRemindMe: params.showRemindMe || false
            });

            var messageShown = new Message(
                messageCode, {
                    pinOnHide: false,
                    siteMessageLinkName: 'membership message',
                    siteMessageCloseBtn: 'hide',
                    siteMessageComponentName: params.campaignCode,
                    trackDisplay: true,
                    cssModifierClass: colourClass
                }).show(renderedBanner);

            if (messageShown) {
                mediator.emit('membership-message:display');

                if(params.showRemindMe) {
                    setSecondaryButtonListener();

                    trackGAEvent('display', 'engagement-banner', 'engagement-banner-remind-me');
                }
            }

            mediator.emit('banner-message:complete');
        }

        function trackGAEvent(category, action, label) {
            var gaTracker = null;

            if(config.googleAnalytics) {
                 gaTracker = config.googleAnalytics.trackers.editorial;
            }

            if(gaTracker && window.ga){
                window.ga(gaTracker + '.send', 'event', category, action, label);
            }

        }

        function emailIsValid(email) {
            return typeof email === 'string' && email.indexOf('@') > -1;
        }

        function sendEmail(email){
            submitForm(email, LIST_ID).then(showThankYouMessage, showErrorMessage)
        }

        function showThankYouMessage(){
            hideElement($(REMIND_ME_TEXT_FIELD));
            hideElement($(REMIND_ME_CTA));
            hideElement($(REMIND_ME_ERROR));

            showElement($(REMIND_ME_THANKS_MESSAGE));
        }

        function showErrorMessage(){
            hideElement($(REMIND_ME_TEXT_FIELD));
            hideElement($(REMIND_ME_CTA));
            showElement($(REMIND_ME_ERROR));
        }

        function submitForm(email, listID) {
            var formQueryString =
                'email=' + encodeURI(email) + '&' +
                'listId=' + listID;

            return fetch(config.page.ajaxUrl + EMAIL_PATH,
                {   method: 'post',
                    body: formQueryString,
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );
        }

        function showElement(element) {
            element.removeClass('is-hidden');
        }

        function hideElement(element) {
            element.addClass('is-hidden');
        }

        function setSecondaryButtonListener() {

            bean.on($(SECONDARY_BUTTON)[0], 'click', function () {
                hideElement($(SECONDARY_BUTTON));
                showElement($(REMIND_ME_FORM));

                trackGAEvent('click', 'engagement-banner', 'remind-me-button');
            });

            bean.on($(REMIND_ME_CTA)[0], 'click', function () {
                var email = $(REMIND_ME_TEXT_FIELD)[0].value;

                if(emailIsValid(email)){
                    trackGAEvent('click', 'engagement-banner', 'send-email');
                    sendEmail(email);
                } else {
                    showElement($(REMIND_ME_ERROR));
                }
            });
        }

        function init() {
            var bannerParams = deriveBannerParams();

            if (bannerParams && (storage.local.get('gu.alreadyVisited') || 0) >= bannerParams.minArticles) {
                return commercialFeatures.async.canDisplayMembershipEngagementBanner.then(function (canShow) {

                    if (canShow) {
                        mediator.on('modules:onwards:breaking-news:ready', function (breakingShown) {
                            if (!breakingShown) {
                                showBanner(bannerParams);
                            }
                        });
                    }
                });
            }

            return Promise.resolve();
        }

        function selectSequentiallyFrom(array) {
            return array[storage.local.get('gu.alreadyVisited') % array.length];
        }

        return {
            init: init,
            messageCode: messageCode
        };
    }
);
