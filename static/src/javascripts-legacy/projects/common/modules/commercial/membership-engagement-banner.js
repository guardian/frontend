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
        'common/views/svgs'
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
                 svgs) {

        // change messageCode to force redisplay of the message to users who already closed it.
        // messageCode is also consumed by .../test/javascripts/spec/common/commercial/membership-engagement-banner.spec.js
        var messageCode = 'engagement-banner-2017-01-11';

        var baseParams = {
            minArticles: 10,
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
                    messageText: 'The Guardian’s voice is needed now more than ever. Support our journalism for just $69/€49 per year.',
                    campaignCode: "mem_int_banner",
                    minArticles: 3
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

        function init() {
            var bannerParams = deriveBannerParams();

            if (bannerParams && (storage.local.get('gu.alreadyVisited') || 0) >= bannerParams.minArticles) {
                return commercialFeatures.async.canDisplayMembershipEngagementBanner.then(function (canShow) {
                    if (canShow) {
                        showBanner(bannerParams);
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
