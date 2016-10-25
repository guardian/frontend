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
    'common/modules/experiments/ab',
    'common/utils/$',
    'common/views/svgs'
], function (
    bean,
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
    ab,
    $,
    svgs
) {

    var endpoints = {
        UK: 'https://membership.theguardian.com/uk/supporter',
        US: 'https://membership.theguardian.com/us/supporter',
        AU: 'https://membership.theguardian.com/au/supporter',
        INT: 'https://membership.theguardian.com/supporter'
    };

    // change messageCode to force redisplay of the message to users who already closed it.
    // messageCode is also consumed by .../test/javascripts/spec/common/commercial/membership-engagement-banner.spec.js
    var messageCode = 'engagement-banner-2016-10-12';

    var messages = {
        UK: {
            campaign: 'mem_uk_banner',
            messageText: 'For less than the price of a coffee a week, you could help secure the Guardian’s future. Support our journalism for just £49 per year.'
        },
        US: {
            campaign: 'mem_us_banner',
            messageText: 'We need your help to support our fearless, independent journalism. Become a Guardian US Member for just $49 a year.'
        },
        AU: {
            campaign: 'mem_au_banner',
            messageText: 'We need you to help support our fearless independent journalism. Become a Guardian Australia Member for just $100 a year.'
        },
        INT: {
            campaign: 'mem_int_banner',
            messageText: 'The Guardian’s voice is needed now more than ever. Support our journalism for just $49/€49 per year.'
        }
    };

    function formatEndpointUrl(edition, message) {
        return endpoints[edition] + '?INTCMP=' + message.campaign;
    }

    function thisInstanceColour(colours) {
        // Rotate through different colours on successive page views
        return colours[storage.local.get('gu.alreadyVisited') % colours.length];
    }

    var getCustomJs = function(options) {
        if (options === undefined) {
            return;
        }

        var opts = options || {};

        if (opts.testName) {
            if (opts.testName === 'prominent-level-1') {
                var buttonCaption = $('#membership__engagement-message-button-caption'),
                    buttonEl = $('#membership__engagement-message-button');

                buttonEl.removeClass('is-hidden');
                if (opts.addButtonClass) {
                    buttonEl.addClass(opts.addButtonClass);
                }
                if (opts.setButtonText) {
                    buttonCaption.text(opts.setButtonText);
                }
                if (opts.parentColour) {
                    buttonEl.addClass(opts.parentColour);
                }
            }

            if (opts.testName === 'messaging-test-1') {
                var engagementText = $('.site-message__message.site-message__message--membership');
                if (engagementText && opts.setEngagementText) {
                    engagementText[0].textContent = opts.setEngagementText;
                }
            }
        }
    };

    function show(edition, message) {
        var colours = ['default','vibrant-blue','yellow','light-blue','deep-purple','teal'],
            thisColour = thisInstanceColour(colours),
            cssModifierClass = 'membership-message-' + thisColour,
            campaignCode = message.campaign,
            customJs = null,
            customOpts = {},
            prominentTestVariant = ab.testCanBeRun('MembershipEngagementWarpFactorOne') ? ab.getTestVariantId('MembershipEngagementWarpFactorOne') : undefined,
            messagingTestVariant = ab.testCanBeRun('MembershipEngagementMessageCopyExperiment') ? ab.getTestVariantId('MembershipEngagementMessageCopyExperiment') : undefined,
            linkHref = formatEndpointUrl(edition, message);

        if (prominentTestVariant) {
            var prominentTestName = 'prominent-level-1';

            if (prominentTestVariant !== 'notintest') {
                campaignCode = 'gdnwb_copts_mem_banner_prominent1uk' + '__' + prominentTestVariant;
                linkHref = endpoints[edition] + '?INTCMP=' + campaignCode;
            }

            if (prominentTestVariant === 'become') {
                colours = ['yellow','purple','bright-blue','dark-blue'];
                thisColour = thisInstanceColour(colours);
                cssModifierClass = 'membership-message' + ' ' + prominentTestName + ' ' + thisColour;
                customOpts = {
                    testName: prominentTestName,
                    addButtonClass: prominentTestName + '_' + prominentTestVariant,
                    setButtonText: 'Become a Supporter',
                    parentColour: thisColour
                };
                customJs = getCustomJs;
            }
        }

        if (messagingTestVariant) {
            var messagingTestName = 'messaging-test-1';
            if (messagingTestVariant !== 'notintest') {
                var variantMessages = {
                    text_a: 'TODO: Add text for first variant',
                    text_b: 'TODO: Add text for second variant',
                    text_c: 'TODO: Add text for third variant'
                };
                campaignCode = 'gdnwb_copts_mem_banner_messaging1uk' + '__' + messagingTestVariant;
                linkHref = endpoints[edition] + '?INTCMP=' + campaignCode;
                customOpts = {
                    testName: messagingTestName,
                    setEngagementText: messagingTestVariant === 'control' ? undefined : variantMessages[messagingTestVariant]
                };
                customJs = getCustomJs;
            }
        }

        var renderedBanner = template(messageTemplate, { messageText: message.messageText, linkHref: linkHref, arrowWhiteRight: svgs('arrowWhiteRight') });
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
            var userHasMadeEnoughVisits = (storage.local.get('gu.alreadyVisited') || 0) >= 10;
            return commercialFeatures.async.canDisplayMembershipEngagementBanner.then(function (canShow) {
                if (canShow && userHasMadeEnoughVisits) {
                    show(edition, message);
                }
            });
        }
        return Promise.resolve();
    }

    return {
        init: init,
        messageCode: messageCode
    };

});
