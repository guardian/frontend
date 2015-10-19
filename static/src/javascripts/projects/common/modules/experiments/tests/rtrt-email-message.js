define([
    'common/utils/config',
    'common/utils/template',
    'common/modules/ui/message',
    'text!common/views/general-message.html',
    'common/views/svgs',
    'common/utils/_',
    'common/modules/commercial/third-party-tags/krux'
], function (
    config,
    template,
    Message,
    messageTemplate,
    svgs,
    _,
    krux
) {

    var messageId = 'rtrt-email-message';

    return function () {

        var messageOptions = {
                siteMessageLinkName: 'rtrt : message : email sign-up',
                siteMessageCloseBtn: 'hide',
                widthBasedMessage: true
            },
            messageTemplateOptions = {
                linkHref: 'http://www.theguardian.com/world/2013/oct/04/1',
                messageTextWide: 'Get the day\'s top news and commentary delivered to your inbox each morning in our Guardian Today email',
                messageTextNarrow: 'Get the day\'s top news and commentary delivered to your inbox each morning',
                linkText: 'Sign up',
                linkName: 'rtrt : message : email sign-up button',
                arrowWhiteRight: svgs('arrowWhiteRight')
            };

        this.id = 'RtrtEmailMessage';
        this.start = '2015-10-15';
        this.expiry = '2015-11-15';
        this.author = 'Gareth Trufitt';
        this.description = 'Test likelihood of email sign-up with 3 visits to the home page vs showing to all visitors on article pages';
        this.audience = 0.01;
        this.audienceOffset = 0;
        this.successMeasure = 'Loyal users shown the email sign-up message are more likely to sign up';
        this.audienceCriteria = 'Users on article pages';
        this.dataLinkNames = '';
        this.idealOutcome = 'Users will sign up to email';

        this.canRun = function () {
            return true;
        };

        this.variants = [{
            id: 'targeted',
            test: function () {
                var kruxSegmentId = 'o901c5kja',
                    userIsInSegment = _.contains(krux.getSegments(), kruxSegmentId);

                // If user is in our segment
                if (userIsInSegment) {
                    new Message(messageId, messageOptions).show(template(messageTemplate, messageTemplateOptions));

                    // Require omniture inline to avoid circular dependency
                    // (ab requires this file, this file requires omniture, omniture requires ab)
                    require(['common/modules/analytics/omniture'], function (omniture) {
                        omniture.trackLink(this, 'Email sign-up message for segment ' + kruxSegmentId + ' shown');
                    });
                }
            }
        },
        {
            id: 'all',
            test: function () {
                new Message(messageId, messageOptions).show(template(messageTemplate, messageTemplateOptions));
            }
        }];

    };

});
