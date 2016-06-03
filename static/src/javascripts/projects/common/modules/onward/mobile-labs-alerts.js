define([
    'common/views/svgs',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/template',
    'common/modules/ui/message',
    '!text!common/views/mobile-labs/presidential-primary-alerts.html',
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


    var usElectionTag = 'us-news/us-elections-2016',
        messageId = 'mobile-labs-alert',
        messageOptions = {
            siteMessageLinkName: 'mobile labs | message | presidential primary alerts',
            siteMessageCloseButton: 'hide',
            cssModifierClass: 'mobile-labs'
        },

        messageTemplateOptions = {
            linkHref: 'http://www.gdnmobilelab.com/primaries',
            linkText: 'Sign up now',
            linkName: 'site-message--mobile-labs',
            messageHeadline: 'Interested in the U.S elections?',
            messageText: 'Get experimental mobile alerts during the June 7 presidential primary',
            arrowWhiteRight: svgs('arrowWhiteRight')
        };

    function canShowPromo() {
        return isSwitchedOn() && UsUser() && mobileChromeUser() && isUsElection();
    }

    function isSwitchedOn() {
       return config.switches.mobileLabPresidentialPrimaries;
    }

    function UsUser() {
        return config.page.edition && config.page.edition === 'US';
    }

    function mobileChromeUser() {
        return detect.isAndroid() && detect.getUserAgent.browser === 'Chrome';
    }

    function isUsElection() {
        return some(config.page.keywordIds.split(','), function(keywordId) {
            return keywordId === usElectionTag;
        });
    }

    return function () {
        if (canShowPromo()) {
            new Message(messageId, messageOptions).show(template(messageTemplate, messageTemplateOptions));
        }
    };

});
