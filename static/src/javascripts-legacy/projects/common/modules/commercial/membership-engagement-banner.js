define([
        'bean',
        'lib/$',
        'lib/config',
        'lib/storage',
        'lodash/utilities/template',
        'common/modules/ui/message',
        'raw-loader!common/views/membership-message.html',
        'commercial/modules/commercial-features',
        'commercial/modules/user-features',
        'lib/mediator',
        'Promise',
        'lib/fastdom-promise',
        'common/modules/experiments/ab',
        'common/modules/experiments/tests/membership-engagement-banner-tests',
        'lodash/objects/assign',
        'lodash/collections/find',
        'common/views/svgs',
        'lib/fetch',
        'common/modules/experiments/segment-util',
        'common/modules/experiments/acquisition-test-selector',
        'common/modules/commercial/membership-engagement-banner-parameters',
        'ophan/ng'
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
                 assign,
                 find,
                 svgs,
                 fetch,
                 segmentUtil,
                 acquisitionTestSelector,
                 membershipEngagementBannerUtils,
                 ophan) {


        // change messageCode to force redisplay of the message to users who already closed it.
        // messageCode is also consumed by .../test/javascripts/spec/common/commercial/membership-engagement-banner.spec.js
        var messageCode = 'engagement-banner-2017-03-30';

        //Remind me form selectors
        var SECONDARY_BUTTON = '.secondary';
        var REMIND_ME_FORM = '.membership__remind-me-form';
        var REMIND_ME_TEXT_FIELD = '.membership__engagement-text-field';
        var REMIND_ME_CTA = '.membership__remind-me-form__cta';
        var REMIND_ME_THANKS_MESSAGE = '.membership__remind-me-form__thanks-message';
        var REMIND_ME_ERROR = '.membership__remind-me-form__error';

        var LIST_ID = 3813;
        var EMAIL_PATH = '/email';

        var DO_NOT_RENDER_ENGAGEMENT_BANNER = 'do no render engagement banner';

        function getUserTest() {
            var engagementBannerTests = MembershipEngagementBannerTests
                .concat(acquisitionTestSelector.epicEngagementBannerTests);

            return find(engagementBannerTests, function(test) {
                return ab.testCanBeRun(test) && segmentUtil.isInTest(test)
            });
        }

        function getUserVariant(test) {
            return test ? segmentUtil.variantFor(test) : undefined;
        }

        function buildCampaignCode(offering, campaignId, variantId) {
            var prefix = '';
            var offerings = membershipEngagementBannerUtils.offerings;

            // mem and cont chosen to be consistent with default campaign code prefixes.
            if (offering === offerings.membership) {
                prefix = 'mem_';
            }
            else if (offering === offerings.contributions) {
                prefix = 'cont_';
            }

            return prefix + campaignId + '_' + variantId;
        }

        function getUserVariantParams(userVariant, campaignId, defaultOffering) {

            if (userVariant && userVariant.engagementBannerParams) {
                var userVariantParams = userVariant.engagementBannerParams;

                if (!userVariantParams.campaignCode) {
                    var offering = userVariantParams.offering || defaultOffering;
                    userVariantParams.campaignCode = buildCampaignCode(offering, campaignId, userVariant.id);
                }

                return userVariantParams;
            } else {
                return {};
            }
        }

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
            var defaultParams = membershipEngagementBannerUtils.defaultParams;
            var userTest = getUserTest();
            var campaignId = userTest ? userTest.campaignId : undefined;
            var userVariant = getUserVariant(userTest);

            if (userVariant && userVariant.blockEngagementBanner) {
                return DO_NOT_RENDER_ENGAGEMENT_BANNER;
            }

            return assign({}, defaultParams, getUserVariantParams(userVariant, campaignId, defaultParams.offering));
        }

        // Used to send an interaction if the engagement banner is shown.
        function recordInteraction(interaction) {
            if (interaction) {
                var component = interaction.component;
                var value = interaction.value;

                if (component && value) {
                    ophan.record({
                        component: component,
                        value: value
                    })
                }
            }
        }

        function showBanner(params) {

            if (params === DO_NOT_RENDER_ENGAGEMENT_BANNER) {
                return;
            }

            var colourClass = params.colourStrategy();

            var messageText = Array.isArray(params.messageText)?selectSequentiallyFrom(params.messageText):params.messageText;

            var renderedBanner = template(messageTemplate, {
                linkHref: params.linkUrl + '?INTCMP=' + params.campaignCode,
                messageText: messageText,
                buttonCaption: params.buttonCaption,
                colourClass: colourClass,
                arrowWhiteRight: svgs('arrowWhiteRight'),
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

                recordInteraction(params.interactionOnMessageShown);

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
