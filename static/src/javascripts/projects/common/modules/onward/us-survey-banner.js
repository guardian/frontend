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
            linkHref: 'http://www.gdnmobilelab.com/primaries?referrer=' + getReferrer(),
            linkText: 'Sign up now',
            linkName: 'site-message--mobile-labs',
            messageHeadline: 'Interested in the U.S elections?',
            messageText: 'Get experimental mobile alerts during the June 7 presidential primary',
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
                {id: 'facebook', match: 'facebook.com'},
                {id: 'twitter', match: 't.co/'}, // added (/) because without slash it is picking up reddit.com too
                {id: 'googleplus', match: 'plus.url.google'},
                {id: 'reddit', match: 'reddit.com'},
                {id: 'google', match: 'www.google'},
                {id: 'theguardian', match: 'theguardian.com'},
                {id: 'localhost', match: 'localhost'},
                {id: 'drudge', match: 'drudgereport.com'}
            ],
            matchedRef = referrerTypes.filter(function (referrerType) {
                return detect.getReferrer().indexOf(referrerType.match) > -1;
            })[0] || {};

        return matchedRef.id;
    };

    function isSwitchedOn() {
        return config.switches.USSurveyBanner
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