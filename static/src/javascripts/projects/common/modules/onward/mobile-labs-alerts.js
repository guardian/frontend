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

    var usElectionTag = "us-news/us-elections-2016",
        messageId = "mobile-labs-alert",
        messageOptions = {
            siteMessageLinkName: 'mobile labs | message | presidential primary alerts',
            siteMessageCloseButton: 'hide',
            cssModifierClass: "mobile-labs"
        },

        messageTemplateOptions = {
            linkHref: 'http://www.gdnmobilelab.com/primaries',
            linkText: 'Sign up now',
            linkName: 'site-message--mobile-labs',
            messageText: 'Interested in the U.S elections?',
            arrowWhiteRight: svgs('arrowWhiteRight')
        };


    function canShowPromo() {
        var isPromoSwitchedOn = isSwitchedOn(),
            isUsUser = UsUser(),
            isMobileChromeUser = mobileChromeUser(),
            isUsElectionPage = isUsElection();

        console.log("++ Can we, can't we?  Switch" +  isPromoSwitchedOn + " US user: " + isUsUser + " mobile chrome " + isMobileChromeUser + " Election: " + isUsElectionPage);
        return isPromoSwitchedOn && isUsUser && isUsElectionPage;
    }

    function isSwitchedOn() {
       return config.switches.mobileLabPresidentialPrimaries;
}

    function UsUser() {
        return config.page.edition && config.page.edition === 'US'
    }

    function mobileChromeUser() {
        return detect.isAndroid() && detect.getUserAgent.browser === 'Chrome';
    }

    function isUsElection() {
        return some(config.page.keywordIds.split(","), function(keywordId) {
            return keywordId === usElectionTag
        })
    }

    return function () {
        if (canShowPromo()) {
            console.log("Showing At: ");
            new Message(messageId, messageOptions).show(template(messageTemplate, messageTemplateOptions));
            console.log("Shown At: ");
        }
    }

});
