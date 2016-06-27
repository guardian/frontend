define([
    'common/views/svgs',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/template',
    'common/modules/ui/message',
    'text!common/views/mobile-labs-alerts.html',
    'lodash/collections/some'
],function(
    svgs,
    config,
    detect,
    template,
    Message,
    messageTemplate,
    some
){


    var politicsTag = 'politics/politics',
        euReferendumTag = 'politics/eu-referendum',
        messageId = 'mobile-labs-alert',
        messageOptions = {
            siteMessageLinkName: 'mobile labs | message | brexit referendum alerts',
            siteMessageCloseButton: 'hide',
            cssModifierClass: 'mobile-labs'
        },

        messageTemplateOptions = {
            linkHref: 'http://www.gdnmobilelab.com/brexit',
            linkText: 'Sign up now',
            linkName: 'site-message--mobile-labs',
            messageHeadline: 'Interested in the Brexit vote?',
            messageText: 'Get experimental mobile alerts during the EU referendum on 23 June.',
            arrowWhiteRight: svgs('arrowWhiteRight')
        };

    function canShowPromo() {
        return isSwitchedOn() && mobileChromeUser() && inTargetSection();
    }

    function isSwitchedOn() {
        return config.switches.mobileLabBrexitBanner;
    }


    function mobileChromeUser() {
        return detect.isAndroid() && detect.getUserAgent.browser === 'Chrome';
    }

    function inTargetSection() {
        return some(config.page.keywordIds.split(','), function(keywordId) {
            return keywordId === politicsTag || keywordId === euReferendumTag;
        });
    }

    return function () {
        if (canShowPromo()) {
            new Message(messageId, messageOptions).show(template(messageTemplate, messageTemplateOptions));
        }
    };

});
