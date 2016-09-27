define([
    'common/views/svgs',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/template',
    'common/modules/ui/message',
    'common/modules/user-prefs',
    'text!common/views/experiments/us-survey-banner.html'
],function(
    svgs,
    config,
    detect,
    template,
    Message,
    userPrefs,
    messageTemplate
){

    var messageId = 'mobile-labs-alert',
        messageOptions = {
            siteMessageCloseButton: 'hide',
            cssModifierClass: 'mobile-labs'
        },

        messageTemplateOptions = {
            linkHref: getLinkHref(),
            linkText: 'Tell us',
            messageHeadline: 'We\'d love to know what you think about Guardian US',
            arrowWhiteRight: svgs('arrowWhiteRight')
        };

    function canShowPromo() {
        return isSwitchedOn() && UsUser() && !hasSeenMessage(messageId);
    }

    function hasSeenMessage(messageName) {
        var messageStates = userPrefs.get('messages');
        return messageStates && messageStates.indexOf(messageName) > -1;
    }

    function getLinkHref() {
        var referrerTypes = [
                {id: 'https://surveys.theguardian.com/R.aspx?a=830&as=II4Hb66oK3', match: 'facebook.com'},
                {id: 'https://surveys.theguardian.com/R.aspx?a=831&as=Xv2WU9YY4G', match: 't.co/'}, // added (/) because without slash it is picking up reddit.com too
                {id: 'https://surveys.theguardian.com/R.aspx?a=829&as=z9Qp2vI8FD', match: 'www.google'},
                {id: 'https://surveys.theguardian.com/R.aspx?a=832&as=ug1hG6DF26', match: 'theguardian.com'}
            ],
            matchedRef = referrerTypes.filter(function (referrerType) {
                return detect.getReferrer().indexOf(referrerType.match) > -1;
            })[0] || {id: 'https://surveys.theguardian.com/R.aspx?a=833&as=X7Uq6MA5CB'};

        return matchedRef.id;
    }

    function isSwitchedOn() {
        return config.switches.usSurveyBanner;
    }

    function UsUser() {
        return config.page.edition && config.page.edition === 'US';
    }

    function init() {
        if (canShowPromo()) {
            var message = new Message(messageId, messageOptions);
            if (message.show(template(messageTemplate, messageTemplateOptions))) {
                message.remember();
            }
        }
    }

    return init;

});