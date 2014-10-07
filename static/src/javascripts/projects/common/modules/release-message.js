define([
    'common/utils/detect',
    'common/utils/preferences',
    'common/utils/template',
    'common/modules/ui/message'
], function (
    detect,
    preferences,
    template,
    Message
) {

    var messages = {
            video: {
                text: 'We’ve redesigned our video pages to make it easier to find and experience our best video content. We’d love to hear what you think.',
                blog: 'http://next.theguardian.com/blog/video-redesign/',
                survey: 'https://www.surveymonkey.com/s/guardianvideo'
            },
            audio: {
                text: 'We’ve redesigned our audio pages to make it easier to find and experience our best audio content. We’d love to hear what you think.',
                survey: 'https://www.surveymonkey.com/s/guardian_audio'
            },
            gallery: {
                text: 'We’ve redesigned our gallery pages to make it easier to find and experience our best gallery content. We’d love to hear what you think.',
                blog: 'http://next.theguardian.com/blog/gallery-redesign/',
                survey: 'https://www.surveymonkey.com/s/guardian_galleries'
            },
            liveblog: {
                text: 'We’ve redesigned our live blogs to make it easier to get the whole picture. We’d love to hear what you think.',
                blog: 'http://next.theguardian.com/blog/liveblog-redesign/',
                survey: 'https://www.surveymonkey.com/s/guardianliveblogs'
            }
        },
        releaseMessage = {
            show: function (type, msgConfig) {
                var blogItem = msgConfig.blog ?
                        template(
                            '<li class="site-message__actions__item">' +
                                '<i class="i i-arrow-white-right"></i>' +
                                '<a href="{{blog}}" target="_blank">Find out more</a>' +
                            '</li>', msgConfig
                        ) : '',
                    msg = template(
                        '<p class="site-message__message" id="site-message__message">{{text}}</p>' +
                        '<ul class="site-message__actions u-unstyled">' +
                            '{{blogItem}}' +
                            '<li class="site-message__actions__item">' +
                                '<i class="i i-arrow-white-right"></i>' +
                                '<a href="{{survey}}" target="_blank">Leave feedback</a>' +
                            '</li>' +
                        '</ul>',
                        {
                            text:     msgConfig.text,
                            blogItem: blogItem,
                            survey:   msgConfig.survey
                        }
                    );
                new Message(type + '-release', { pinOnHide: true }).show(msg);
            },
            init: function (config) {
                if (
                    detect.getBreakpoint() !== 'mobile' &&
                    !preferences.hasOptedIntoResponsive() &&
                    config.page.contentType
                ) {
                    var contentType = config.page.contentType.toLowerCase(),
                        msgConfig   = messages[contentType];
                    if (msgConfig) {
                        releaseMessage.show(contentType, msgConfig);
                    }
                }
            }
        };

    return releaseMessage;

});
