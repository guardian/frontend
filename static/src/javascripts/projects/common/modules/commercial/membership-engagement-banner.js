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
        'common/utils/$',
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
                 $,
                 svgs) {

        var endpoints = {
            UK: 'https://membership.theguardian.com/uk/supporter',
            US: 'https://contribute.theguardian.com',
            AU: 'https://membership.theguardian.com/au/supporter',
            INT: 'https://membership.theguardian.com/supporter'
        };

        // change messageCode to force redisplay of the message to users who already closed it.
        // messageCode is also consumed by .../test/javascripts/spec/common/commercial/membership-engagement-banner.spec.js
        var messageCode = 'engagement-banner-2016-11-10';
        var notInTest = 'notintest';

        var messages = {
            UK: {
                campaign: 'mem_uk_banner',
                messageText: 'For less than the price of a coffee a week, you could help secure the Guardian’s future. Support our journalism for £5 a month.',
                buttonCaption: 'Become a Supporter'
            },
            US: {
                campaign: 'mem_us_banner',
                messageText: 'If you use it, if you like it, then why not pay for it? It’s only fair.',
                buttonCaption: 'Make a Contribution'
            },
            AU: {
                campaign: 'mem_au_banner',
                messageText: 'We need you to help support our fearless independent journalism. Become a Guardian Australia Member for just $100 a year.',
                buttonCaption: 'Become a Supporter'
            },
            INT: {
                campaign: 'mem_int_banner',
                messageText: 'The Guardian’s voice is needed now more than ever. Support our journalism for just $69/€49 per year.',
                buttonCaption: 'Become a Supporter'
            }
        };

        function doInternationalTest(content) {
            var variant = getVariant('MembershipEngagementInternationalExperiment');
            if (variant && variant !== notInTest) {
                var campaignCode = 'gdnwb_copts_mem_banner_ROWbanner__' + variant;
                content.campaignCode = campaignCode;
                content.linkHref = formatEndpointUrl('INT', campaignCode);
            }
        }

        function show(edition, message) {
            var content = {
                linkHref: formatEndpointUrl(edition, message.campaign),
                messageText: message.messageText,
                campaignCode: message.campaign,
                buttonCaption: message.buttonCaption,
                colourClass: thisInstanceColour(),
                arrowWhiteRight: svgs('arrowWhiteRight')
            };

            doInternationalTest(content);

            var renderedBanner = template(messageTemplate, content);
            var messageShown = new Message(
                messageCode,
                {
                    pinOnHide: false,
                    siteMessageLinkName: 'membership message',
                    siteMessageCloseBtn: 'hide',
                    siteMessageComponentName: content.campaignCode,
                    trackDisplay: true,
                    cssModifierClass: 'membership-prominent ' + content.colourClass
                }).show(renderedBanner);
            if (messageShown) {
                mediator.emit('membership-message:display');
            }
            mediator.emit('banner-message:complete');
            return messageShown;
        }

        function init() {
            var edition = config.page.edition;
            var message = messages[edition];
            if (message) {
                if (userHasMadeEnoughVisits(edition)) {
                    return commercialFeatures.async.canDisplayMembershipEngagementBanner.then(function (canShow) {
                        if (canShow) {
                            show(edition, message);
                        }
                    });
                }
            }
            return Promise.resolve();
        }

        function userHasMadeEnoughVisits(edition) {
            if (edition === 'INT') {
                var internationalTestVariant = getVariant('MembershipEngagementInternationalExperiment');
                if (internationalTestVariant == '1st_article')
                    return true;
            }

            return (storage.local.get('gu.alreadyVisited') || 0) >= 10;
        }

        function formatEndpointUrl(edition, campaignCode) {
            return endpoints[edition] + '?INTCMP=' + campaignCode;
        }

        function thisInstanceColour() {
            var colours = ['yellow', 'purple', 'bright-blue', 'dark-blue'];
            // Rotate through different colours on successive page views
            return colours[storage.local.get('gu.alreadyVisited') % colours.length];
        }

        function getVariant(variantName) {
            return ab.testCanBeRun(variantName) ? ab.getTestVariantId(variantName) : undefined;
        }

        return {
            init: init,
            messageCode: messageCode
        };

    }
);
