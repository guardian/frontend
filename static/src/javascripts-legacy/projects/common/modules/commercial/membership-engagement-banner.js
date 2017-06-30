define([
        'bean',
        'lib/$',
        'lib/config',
        'lib/storage',
        'lodash/utilities/template',
        'common/modules/ui/message',
        'raw-loader!common/views/membership-message.html',
        'commercial/modules/commercial-features',
        'lib/mediator',
        'lib/fastdom-promise',
        'common/modules/experiments/test-can-run-checks',
        'common/modules/experiments/tests/membership-engagement-banner-tests',
        'lodash/objects/assign',
        'lodash/collections/find',
        'common/views/svgs',
        'lib/fetch',
        'common/modules/experiments/segment-util',
        'common/modules/experiments/acquisition-test-selector',
        'common/modules/commercial/membership-engagement-banner-parameters',
        'common/modules/commercial/membership-engagement-banner-block',
        'common/modules/commercial/contributions-utilities',
        'ophan/ng',
        'lib/geolocation',
        'lib/url'
    ], function (bean,
                 $,
                 config,
                 storage,
                 template,
                 Message,
                 messageTemplate,
                 commercialFeatures,
                 mediator,
                 fastdom,
                 testCanRunChecks,
                 MembershipEngagementBannerTests,
                 assign,
                 find,
                 svgs,
                 fetch,
                 segmentUtil,
                 acquisitionTestSelector,
                 membershipEngagementBannerUtils,
                 membershipEngagementBannerBlock,
                 contributionsUtilities,
                 ophan,
                 geolocation,
                 url) {


        // change messageCode to force redisplay of the message to users who already closed it.
        // messageCode is also consumed by .../test/javascripts/spec/common/commercial/membership-engagement-banner.spec.js
        var messageCode = 'engagement-banner-2017-06-08';

        var DO_NOT_RENDER_ENGAGEMENT_BANNER = 'do no render engagement banner';

        function getUserTest() {
            var engagementBannerTests = MembershipEngagementBannerTests
                .concat(acquisitionTestSelector.epicEngagementBannerTests);

            return find(engagementBannerTests, function(test) {
                return testCanRunChecks.testCanBeRun(test) && segmentUtil.isInTest(test)
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

            if (userVariant && userVariant.options && userVariant.options.engagementBannerParams) {
                var userVariantParams = userVariant.options.engagementBannerParams;

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
        function deriveBannerParams(location) {
            var defaultParams = membershipEngagementBannerUtils.defaultParams(location);
            var userTest = getUserTest();
            var campaignId = userTest ? userTest.campaignId : undefined;
            var userVariant = getUserVariant(userTest);

            if (userVariant && userVariant.options && userVariant.options.blockEngagementBanner) {
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

        var paypalAndCreditCardImage = (config.images && config.images.acquisitions && config.images.acquisitions['paypal-and-credit-card']) || '';


        function showBanner(params) {
            

            if (params === DO_NOT_RENDER_ENGAGEMENT_BANNER || membershipEngagementBannerBlock.isBlocked()) {
                return;
            }

            var colourClass = params.colourStrategy();

            var messageText = Array.isArray(params.messageText)?selectSequentiallyFrom(params.messageText):params.messageText;

            var urlParameters = {
                REFPVID : params.pageviewId,
                INTCMP:  params.campaignCode
            };
            var linkUrl = params.linkUrl + '?' + url.constructQuery(urlParameters);

            var renderedBanner = template(messageTemplate, {
                linkHref: linkUrl,
                messageText: messageText,
                buttonCaption: params.buttonCaption,
                colourClass: colourClass,
                arrowWhiteRight: svgs.inlineSvg('arrowWhiteRight'),
                paypalLogoSrc: paypalAndCreditCardImage
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
            }

            mediator.emit('banner-message:complete');
        }

        function init() {

            return geolocation.get().then(function(location) {

                var bannerParams = deriveBannerParams(location);

                if (bannerParams && (storage.local.get('gu.alreadyVisited') || 0) >= bannerParams.minArticles) {
                    return commercialFeatures.commercialFeatures.asynchronous.canDisplayMembershipEngagementBanner.then(function (canShow) {

                        if (canShow) {
                            mediator.on('modules:onwards:breaking-news:ready', function (breakingShown) {
                                if (!breakingShown) {
                                    showBanner(bannerParams);
                                } else {
                                    mediator.emit('banner-message:complete');
                                }
                            });
                        } else {
                            mediator.emit('banner-message:complete');
                        }
                    });
                }
            });
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
