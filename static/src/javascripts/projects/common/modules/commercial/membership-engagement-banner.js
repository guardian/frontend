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
        US: 'https://membership.theguardian.com/us/supporter',
        AU: 'https://membership.theguardian.com/au/supporter',
        INT: 'https://membership.theguardian.com/supporter'
    };

    // change messageCode to force redisplay of the message to users who already closed it.
    // messageCode is also consumed by .../test/javascripts/spec/common/commercial/membership-engagement-banner.spec.js
    var messageCode = 'engagement-banner-2016-11-10';

    var messages = {
        UK: {
            campaign: 'Coffee_49',
            messageText: 'For less than the price of a coffee a week, you could help secure the Guardian’s future. Support our journalism for just £49 per year.'
        },
        US: {
            campaign: 'control',
            messageText: 'If you use it, if you like it, then why not pay for it? It’s only fair.'
        },
        AU: {
            campaign: 'mem_au_banner',
            messageText: 'We need you to help support our fearless independent journalism. Become a Guardian Australia Member for just $100 a year.'
        },
        INT: {
            campaign: 'mem_int_banner',
            messageText: 'The Guardian’s voice is needed now more than ever. Support our journalism for just $69/€49 per year.'
        }
    };

    function formatEndpointUrl(edition, message) {
        return endpoints[edition] + '?INTCMP=' + message.campaign + '_prominent';
    }

    function thisInstanceColour(colours) {
        // Rotate through different colours on successive page views
        return colours[storage.local.get('gu.alreadyVisited') % colours.length];
    }

    var getCustomJs = function (options) {
        if (options === undefined) {
            return;
        }

        var opts = options || {};

        if (opts.setEngagementText) {
            var engagementText = $('#membership__engagement-message-text');
            if (engagementText) {
                engagementText[0].textContent = opts.setEngagementText;
            }
        }

        if (opts.execute) {
            opts.execute();
        }
    };

    function show(edition, message) {
        var colours = ['default', 'vibrant-blue', 'yellow', 'light-blue', 'deep-purple', 'teal'],
            thisColour = thisInstanceColour(colours),
            cssModifierClass = 'membership-message-' + thisColour,
            campaignCode = message.campaign,
            customJs = null,
            customOpts = {},
            messagingTestVariant = ab.testCanBeRun('MembershipEngagementMessageCopyExperiment') ? ab.getTestVariantId('MembershipEngagementMessageCopyExperiment') : undefined,
            usMessagingTestVariant = ab.testCanBeRun('MembershipEngagementUsMessageCopyExperiment') ? ab.getTestVariantId('MembershipEngagementUsMessageCopyExperiment') : undefined,
            internationalTestVariant = ab.testCanBeRun('MembershipEngagementInternationalExperiment') ? ab.getTestVariantId('MembershipEngagementInternationalExperiment') : undefined,
            buttonMessage = 'Become a Supporter',
            linkHref = formatEndpointUrl(edition, message);

        if (messagingTestVariant && messagingTestVariant !== 'notintest') {
            var variantMessages = {
                Get_round_to: 'Not got round to supporting us yet? Now is the time. Give £5 a month today',
                Give_upfront: 'Give £5 a month to help support our journalism and make the Guardian’s future more secure',
                Together_informed: 'Together we can keep the world informed. Give £5 a month to support our journalism',
                Coffee_5: 'For less than the price of a coffee a week, you could help secure the Guardian’s future. Support our journalism for £5 a month'
            };
            campaignCode = 'gdnwb_copts_mem_banner_ukbanner__' + messagingTestVariant;
            linkHref = endpoints[edition] + '?INTCMP=' + campaignCode;
            customOpts = {
                testName: 'messaging-test-1',
                setEngagementText: messagingTestVariant === 'control' ? undefined : variantMessages[messagingTestVariant]
            };
            customJs = getCustomJs;
        }

        if (usMessagingTestVariant && usMessagingTestVariant !== 'notintest') {
            var usVariantMessages = {
                informed: 'Fund our journalism and together we can keep the world informed.'
            };
            buttonMessage = 'Make a Contribution';
            campaignCode = 'co_us_engageb_' + usMessagingTestVariant;
            linkHref = 'https://contribute.theguardian.com?INTCMP=' + campaignCode;
            customOpts = {
                testName: 'messaging-test-us-1',
                setEngagementText: usMessagingTestVariant === 'control' ? undefined : usVariantMessages[usMessagingTestVariant]
            };
            customJs = getCustomJs;
        }

        if (internationalTestVariant && internationalTestVariant !== 'notintest') {
            campaignCode = 'gdnwb_copts_mem_banner_ROWbanner__' + internationalTestVariant;
            linkHref = endpoints[edition] + '?INTCMP=' + campaignCode;
        }

        if (config.switches['prominentMembershipEngagementBannerUk']) {
            colours = ['yellow', 'purple', 'bright-blue', 'dark-blue'];
            thisColour = thisInstanceColour(colours);
            cssModifierClass = 'membership-prominent ' + thisColour;
            customOpts.execute = function () {
                var buttonCaption = $('#membership__engagement-message-button-caption'),
                    buttonEl = $('#membership__engagement-message-button');
                fastdom.write(function () {
                    buttonEl.removeClass('is-hidden');
                    buttonEl.addClass('prominent');
                    buttonEl.addClass(thisColour);
                    buttonCaption.text(buttonMessage);
                });
            };
            customJs = getCustomJs;
        }

        var renderedBanner = template(messageTemplate, {
            messageText: message.messageText,
            linkHref: linkHref,
            arrowWhiteRight: svgs('arrowWhiteRight')
        });
        var messageShown = new Message(
            messageCode,
            {
                pinOnHide: false,
                siteMessageLinkName: 'membership message',
                siteMessageCloseBtn: 'hide',
                siteMessageComponentName: campaignCode,
                trackDisplay: true,
                cssModifierClass: cssModifierClass,
                customJs: customJs,
                customOpts: customOpts
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
        if (edition == 'INT') {
            var internationalTestVariant = ab.testCanBeRun('MembershipEngagementInternationalExperiment') ? ab.getTestVariantId('MembershipEngagementInternationalExperiment') : undefined;
            if (internationalTestVariant == 'first')
                return true;
        }

        return (storage.local.get('gu.alreadyVisited') || 0) >= 10;
    }

    return {
        init: init,
        messageCode: messageCode
    };

});
