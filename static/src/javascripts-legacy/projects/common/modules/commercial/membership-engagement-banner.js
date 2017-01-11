define([
        'bean',
        'qwery',
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
        'common/utils/$',
        'lodash/objects/defaults',
        'lodash/collections/find',
        'common/views/svgs',
        'common/modules/identity/api',
        'common/utils/fetch'
    ], function (bean,
                 qwery,
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
                 $,
                 defaults,
                 find,
                 svgs,
                 identity,
                 fetch) {

        // change messageCode to force redisplay of the message to users who already closed it.
        // messageCode is also consumed by .../test/javascripts/spec/common/commercial/membership-engagement-banner.spec.js
        var messageCode = 'engagement-banner-2017-01-11';

        var SECONDARY_BUTTON_SELECTOR = '.secondary';

        //Remind me form selectors
        var REMIND_ME_FORM_SELECTOR = '.membership__remind-me-form';
        var REMIND_ME_TEXT_FIELD_SELECTOR = '.membership__engagement-text-field';
        var REMIND_ME_CTA_SELECTOR = '.membership__remind-me-form__cta';
        var REMIND_ME_THANKS_MESSAGE_SELECTOR = '.membership__remind-me-form__thanks-message';
        var REMIND_ME_ERROR_SELECTOR = '.membership__remind-me-form__error';

        var SECONDARY_BUTTON = null;
        var REMIND_ME_FORM = null;
        var REMIND_ME_TEXT_FIELD = null;
        var REMIND_ME_CTA = null;
        var REMIND_ME_THANKS_MESSAGE = null;
        var REMIND_ME_ERROR = null;
        var LIST_ID = 3813;

        var baseParams = {
            minArticles: 3,
            colourStrategy: function() {
                return 'membership-prominent ' + selectSequentiallyFrom(['yellow', 'purple', 'bright-blue', 'dark-blue']);
            }
        };

        var offeringParams = {
            membership: {
                mainButtonCaption: 'Become a Supporter',
                secondaryButtonCaption: 'I will do it later',
                linkUrl: 'https://membership.theguardian.com/supporter'
            },
            contributions: {
                mainButtonCaption: 'Make a Contribution',
                secondaryButtonCaption: null,
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
                mainButtonCaption: params.mainButtonCaption,
                secondaryButtonCaption: params.secondaryButtonCaption,
                colourClass: colourClass,
                arrowWhiteRight: svgs('arrowWhiteRight')
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
            }
            mediator.emit('banner-message:complete');
        }

        function emailIsValid(email){
            return typeof email === 'string' && email.indexOf('@') > -1;
        }

        function sendEmail(email){
            submitForm(email, LIST_ID).then(showThankYouMessage, showErrorMessage)
        }

        function showThankYouMessage(){
            hideElement(REMIND_ME_TEXT_FIELD);
            hideElement(REMIND_ME_CTA);
            showElement(REMIND_ME_THANKS_MESSAGE);
        }

        function showErrorMessage(error){
            hideElement(REMIND_ME_TEXT_FIELD);
            hideElement(REMIND_ME_CTA);
            showElement(REMIND_ME_ERROR);
        }

        function submitForm(email, listID) {
            var formQueryString =
                'email+address=' + encodeURI(email) + '&' +
                'lid=' + listID + '&' + 'mid=' + 1059028;

            //Exact target does not support OPTIONS request. Therefore we have to send a POST using
            //'Content-Type': 'application/x-www-form-urlencoded'. Currently is failing because of CORS, we should
            //ignore the (successful)302 or at least see if that is possible. If not, we should use another method than
            //Web Collect (https://help.marketingcloud.com/en/documentation/exacttarget/subscribers/web_collect).
            return fetch(
                'http://cl.exct.net/subscribe.aspx', {
                    method: 'post',
                    body: formQueryString,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    mode: 'cors'
                });
        }

        function getDOMElements(){
            SECONDARY_BUTTON = document.querySelector(SECONDARY_BUTTON_SELECTOR);
            REMIND_ME_FORM = document.querySelector(REMIND_ME_FORM_SELECTOR);
            REMIND_ME_TEXT_FIELD = document.querySelector(REMIND_ME_TEXT_FIELD_SELECTOR);
            REMIND_ME_CTA = document.querySelector(REMIND_ME_CTA_SELECTOR);
            REMIND_ME_THANKS_MESSAGE = document.querySelector(REMIND_ME_THANKS_MESSAGE_SELECTOR);
            REMIND_ME_ERROR = document.querySelector(REMIND_ME_ERROR_SELECTOR);
        }

        function showElement(element) {
            element.classList.remove('hide-element');
        }

        function hideElement(element) {
            element.classList.add('hide-element');
        }

        function setSecondaryButtonListener() {
            getDOMElements();
            bean.on($('.secondary')[0], 'click', function () {
                hideElement(SECONDARY_BUTTON);
                if(!identity.isUserLoggedIn()){
                    showElement(REMIND_ME_FORM);
                }else{
                    var email = identity.getUserFromCookie().primaryEmailAddress;
                    sendEmail(email);
                }

            });

            bean.on($('.membership__remind-me-form__cta')[0], 'click', function () {
                var email = REMIND_ME_TEXT_FIELD.value;
                if(emailIsValid(email)){
                    sendEmail(email);
                }else{
                    showElement(REMIND_ME_ERROR);
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
                                if(bannerParams.secondaryButtonCaption) {
                                    setSecondaryButtonListener();
                                }
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
