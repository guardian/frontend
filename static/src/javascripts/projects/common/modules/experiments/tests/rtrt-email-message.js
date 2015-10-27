define([
    'common/utils/config',
    'common/utils/template',
    'common/modules/ui/message',
    'text!common/views/general-message.html',
    'common/views/svgs',
    'common/utils/_',
    'common/modules/commercial/third-party-tags/krux',
    'common/modules/identity/api',
    'common/utils/mediator'
], function (
    config,
    template,
    Message,
    messageTemplate,
    svgs,
    _,
    krux,
    Id,
    mediator
) {

    var messageId = 'rtrt-email-message';

    return function () {

        var messageOptions = {
                siteMessageLinkName: 'rtrt | message | email sign-up',
                siteMessageCloseBtn: 'hide',
                widthBasedMessage: true
            },
            messageTemplateOptions = {
                linkHref: 'http://www.theguardian.com/world/2013/oct/04/1',
                messageTextWide: 'Get the day\'s top news and commentary delivered to your inbox each morning in our Guardian Today email',
                messageTextNarrow: 'Get the day\'s top news and commentary delivered to your inbox each morning',
                linkText: 'Sign up',
                linkName: 'email sign-up button',
                arrowWhiteRight: svgs('arrowWhiteRight')
            },
            kruxSegmentId = null,
            createMessage = function () {
                var messageShown = false,
                    omnitureEvent = '';

                // If a segment Id is passed and the user is in the segment
                // or there is no kruxSegmentId passed in
                // show the message
                if ((kruxSegmentId && _.contains(krux.getSegments(), kruxSegmentId)) || !kruxSegmentId) {
                    messageShown = new Message(messageId, messageOptions).show(template(messageTemplate, messageTemplateOptions));
                    omnitureEvent = !kruxSegmentId ? 'message for all users shown' : 'message for segment ' + kruxSegmentId + ' shown' ;
                }

                // If the message was shown then pull in omniture and fire off an event
                if (messageShown) {
                    require('common/modules/analytics/omniture', function (omniture) {
                        omniture.trackLinkImmediate('rtrt | message | email sign-up | ' + omnitureEvent);
                    });
                }
            };

        this.id = 'RtrtEmailMessage';
        this.start = '2015-10-15';
        this.expiry = '2015-11-15';
        this.author = 'Gareth Trufitt';
        this.description = 'Test likelihood of email sign-up with 10 visits to the Guardian vs any network front visitor vs showing to all visitors on all pages';
        this.audience = 0.01;
        this.audienceOffset = 0.99;
        this.successMeasure = 'Loyal users shown the email sign-up message higher on the loyalty curve are more likely to sign up';
        this.audienceCriteria = 'Users who match the segments defined in Krux';
        this.dataLinkNames = '';
        this.idealOutcome = 'Users who are more loyal will sign up to email';

        this.canRun = function () {
            return window.location.pathname !== '/world/2013/oct/04/1'
                    && !Id.isUserLoggedIn(); // Only show to non-logged-in users, as testing email sign-up
        };

        this.variants = [
            {
                id: 'targeted-loyal-A',
                test: function () {
                    kruxSegmentId = 'p2lq8cs6r';
                    mediator.once('modules:ui:cookiesBanner:notShown', createMessage); // 10 visits or more to the Guardian
                }
            },
            {
                id: 'targeted-loyal-B',
                test: function () {
                    kruxSegmentId = 'p2lryefg7';
                    mediator.once('modules:ui:cookiesBanner:notShown', createMessage); // A visitor currently on the network front
                }
            },
            {
                id: 'all',
                test: function () {
                    mediator.once('modules:ui:cookiesBanner:notShown', createMessage); // Any visitor, any page
                }
            }
        ];

    };

});
