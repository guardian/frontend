define([
    'common/views/svgs',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/template',
    'common/modules/ui/message',
    'text!common/views/experiments/us-survey-banner.html'
],function(
    svgs,
    config,
    detect,
    template,
    Message,
    messageTemplate
){

    var messageId = 'mobile-labs-alert',
        messageOptions = {
            siteMessageLinkName: 'mobile labs | message | presidential primary alerts',
            siteMessageCloseButton: 'hide',
            cssModifierClass: 'mobile-labs'
        },

        messageTemplateOptions = {
            linkHref: 'http://www.gdnmobilelab.com/primaries?referrer=' + getReferrer(),
            linkText: 'Sign up now',
            linkName: 'site-message--mobile-labs',
            messageHeadline: 'Interested in the U.S elections?',
            messageText: 'Get experimental mobile alerts during the June 7 presidential primary',
            arrowWhiteRight: svgs('arrowWhiteRight')
        };

    function getReferrer() {
        return 'google';
    }

    function canShowPromo() {
        // return isSwitchedOn() && UsUser();
        return true;
    }

    function isSwitchedOn() {
        return config.switches.USSurveyBanner;
    }

    function UsUser() {
        return config.page.edition && config.page.edition === 'US';
    }

    function init() {
        if (canShowPromo()) {
            new Message(messageId, messageOptions).show(template(messageTemplate, messageTemplateOptions));
        }
    }

    return init();

});