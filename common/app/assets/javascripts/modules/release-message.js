define([
    'common/utils/detect',
    'common/utils/preferences',
    'common/modules/ui/message'
], function(
    detect,
    preferences,
    Message
) {

    var messages = {
        video: {
            text: 'We’ve redesigned our video pages to make it easier to find and experience our best video content. We’d love to hear what you think.',
            blog: 'http://next.theguardian.com/blog/video-redesign/',
            survey: 'https://www.surveymonkey.com/s/guardianvideo'
        },
        gallery: {
            text: 'We’ve redesigned our gallery pages to make it easier to find and experience our best gallery content. We’d love to hear what you think.',
            blog: 'http://next.theguardian.com/blog/gallery-redesign/',
            survey: 'https://www.surveymonkey.com/s/guardian_galleries'
        }
    };

    var releaseMessage = {
        show: function(messageText, blogLink, surveyLink) {
            if (detect.getBreakpoint() !== 'mobile' && !preferences.hasOptedIntoResponsive()) {

                var msg =
                    '<p class="site-message__message" id="site-message__message">' +
                        messageText +
                    '</p>' +
                    '<ul class="site-message__actions u-unstyled">' +
                        '<li class="site-message__actions__item">' +
                            '<i class="i i-arrow-white-right"></i>' +
                            '<a href="' + blogLink + '" target="_blank">Find out more</a>' +
                        '</li>' +
                        '<li class="site-message__actions__item">' +
                            '<i class="i i-arrow-white-right"></i>' +
                            '<a href="' + surveyLink + '" target="_blank">Leave feedback</a>' +
                        '</li>' +
                    '</ul>';

                new Message('video', {pinOnHide: true}).show(msg);
            }
        },
        init: function(config) {

            if (config.page.contentType){
                var contentType = config.page.contentType.toLowerCase();
                if (messages[contentType]) {
                    var msg = messages[contentType];
                    releaseMessage.show(msg.text, msg.blog, msg.survey);
                }
            }
        }
    };

    return releaseMessage;

});