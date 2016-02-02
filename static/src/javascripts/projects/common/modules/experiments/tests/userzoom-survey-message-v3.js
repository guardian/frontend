define([
    'common/utils/$',
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/config',
    'lodash/utilities/noop',
    'common/views/svgs',
    'common/utils/template',
    'common/modules/ui/message',
    'text!common/views/survey-message.html',
    'common/utils/detect',
    'common/modules/user-prefs',
    'common/utils/cookies'
], function (
    $,
    bean,
    bonzo,
    fastdom,
    config,
    noop,
    svgs,
    template,
    Message,
    messageTemplate,
    detect,
    userPrefs,
    cookies
) {
    return function () {
        this.id = 'UserzoomSurveyMessageV3';
        this.start = '2016-01-20';
        this.expiry = '2016-02-11';
        this.author = 'Gareth Trufitt';
        this.description = 'Segment the userzoom data-team survey';
        this.audience = 0.2;
        this.audienceOffset = 0.7;
        this.successMeasure = 'Gain qualitative feedback via a survey';
        this.audienceCriteria = '10% of UK visitors to article page, on desktop, that haven\'t seen the message previously';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        var browserId = cookies.get('bwid') || false;

        this.canRun = function () {

            var inUKEdition = config.page.edition && config.page.edition === 'UK',
                notPreviouslySeen = !userPrefs.get('survey-message-seen'),
                onAnArticlePage = config && config.page && config.page.isContent,
                isDesktop = detect.isBreakpoint({
                    min: 'desktop',
                    max: 'wide'
                });

            return inUKEdition && notPreviouslySeen && onAnArticlePage && isDesktop && browserId;
        };

        var messageId = 'survey',
            messageOptions = {
                siteMessageLinkName: 'userzoom-survey | message | email sign-up',
                siteMessageCloseBtn: 'hide',
                cssModifierClass: 'alt'
            },
            messageTemplateOptions = {
                linkHref: 'https://s.userzoom.com/p/MSBDMTBTMjYy/' + browserId,
                linkText: 'Open Survey',
                linkName: 'survey sign-up button',
                messageTextHeadline: 'Tell us about what you love (or don\'t) about the Guardian',
                messageTextWide: 'Complete a quick survey (5 minutes max) and help us make the site better',
                messageTextNarrow: 'Complete a quick survey (5 minutes max) and help us make the site better',
                arrowWhiteRight: svgs('arrowWhiteRight')
            },
            createMessage = function () {
                new Message(messageId, messageOptions).show(template(messageTemplate, messageTemplateOptions));
                userPrefs.set('survey-message-seen', true);
            };

        this.variants = [
            {
                id: 'control',
                test: noop
            },
            {
                id: 'survey-shown',
                test: createMessage
            }
        ];
    };
});
