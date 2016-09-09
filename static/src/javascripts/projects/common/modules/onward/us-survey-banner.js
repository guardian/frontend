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
            siteMessageLinkName: 'mobile labs | message | presidential primary alerts',
            siteMessageCloseButton: 'hide',
            cssModifierClass: 'mobile-labs'
        },

        messageTemplateOptions = {
            linkHref: 'https://surveys.theguardian.com/R.aspx?a=818&as=PM2tx7WG1j?CMP=' + getReferrer() + '_b-perceptionsurvey',
            linkText: 'Tell us',
            messageHeadline: 'We\'d love to know what you think about Guardian US',
            arrowWhiteRight: svgs('arrowWhiteRight')
        };

    function canShowPromo() {
        return isSwitchedOn() && UsUser() && isNewToSurvey();
    }

    function isNewToSurvey() {
        var prefs = userPrefs.get('us-survey-banner');

        if (prefs === null) {
            return true;
        }
    }

    function getReferrer() {
        var referrerTypes = [
                {id: 'fb', match: 'facebook.com'},
                {id: 'twt', match: 't.co/'}, // added (/) because without slash it is picking up reddit.com too
                {id: 'goog', match: 'www.google'},
                {id: 'ons', match: 'theguardian.com'}
            ],
            matchedRef = referrerTypes.filter(function (referrerType) {
                return detect.getReferrer().indexOf(referrerType.match) > -1;
            })[0] || {id: 'unk'};

        return matchedRef.id;
    }

    function isSwitchedOn() {
        return config.switches.USSurveyBanner;
    }

    function UsUser() {
        return config.page.edition && config.page.edition === 'US';
    }

    function init() {
        if (canShowPromo()) {
            userPrefs.set('us-survey-banner', {
                'seen': true
            });
            new Message(messageId, messageOptions).show(template(messageTemplate, messageTemplateOptions));
        }
    }

    return init();

});