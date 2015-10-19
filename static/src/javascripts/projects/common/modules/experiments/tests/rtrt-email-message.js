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
            },
            createMessage = function (kruxSegmentId) {
                // If a segment Id is passed and the user is in the segment, show the message
                // and fire off an omniture tracking call
                if (kruxSegmentId && _.contains(krux.getSegments(), kruxSegmentId)) {
                    new Message(messageId, messageOptions).show(template(messageTemplate, messageTemplateOptions));
                    // Omniture is a global var
                    window.s.trackLink(this, 'Email sign-up message for segment ' + kruxSegmentId + ' shown');
                } else if (!kruxSegmentId) {
                    new Message(messageId, messageOptions).show(template(messageTemplate, messageTemplateOptions));
                }

            };

        this.id = 'RtrtEmailMessage';
        this.start = '2015-10-15';
        this.expiry = '2015-11-15';
        this.author = 'Gareth Trufitt';
        this.description = 'Test likelihood of email sign-up with 3 visits to the home page vs showing to all visitors on all pages';
        this.audience = 0.01;
        this.audienceOffset = 0;
        this.successMeasure = 'Loyal users shown the email sign-up message higher on the loyalty curve are more likely to sign up';
        this.audienceCriteria = 'Users who match the segment defined in Krux';
        this.dataLinkNames = '';
        this.idealOutcome = 'Users will sign up to email';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'targeted-loyal-A',
                test: function () {
                    createMessage('XXXXXXXX');
                }
            },
            {
                id: 'targeted-loyal-B',
                test: function () {
                    createMessage('XXXXXXXX');
                }
            },
            {
                id: 'all',
                test: createMessage
            }
        ];

    };

});
