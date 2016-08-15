define([
    'bean',
    'qwery',
    'common/utils/config',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/ui/message',
    'text!common/views/membership-message.html',
    'common/views/svgs',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/user-features',
    'common/utils/mediator',
    'lodash/objects/defaults'
], function (
    bean,
    qwery,
    config,
    storage,
    template,
    Message,
    messageTemplate,
    svgs,
    commercialFeatures,
    userFeatures,
    mediator,
    defaults
) {

    return function () {
        var self = this;

        this.id = 'MembershipAndContributionsEngagementBanner';
        this.start = '2016-08-11';
        this.expiry = '2016-08-17';
        this.author = 'Roberto Tyley';
        this.description = 'Show contributions as well as membership messages.';
        this.showForSensitive = false;
        this.audience = 1.0;
        this.audienceOffset = 0;
        this.successMeasure = 'Conversion for contributions';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Conversion for contributions beats commercial component conversion by 3x.';

        var minVisited= 10;

        var defaultData = {
            arrowWhiteRight: svgs('arrowWhiteRight')
        };

        // Required by the A/B testing framework - can not be async, unfortunately
        this.canRun = function () {
            return commercialFeatures.syncMembershipMessages &&
                minVisited <= (storage.local.get('gu.alreadyVisited') || 0);
        };

        // Includes an async check to see if user has an ad-blocker enabled
        function asyncCanShowMessageCheck() {
            return commercialFeatures.async.membershipMessages.then(function (canShow) {
                return canShow && self.canRun();
            });
        }

        function showMessageIfAsyncChecksPermit(message, data, cssModifierClass) {
            return asyncCanShowMessageCheck().then(function (weCanShowMessage) {
                if (weCanShowMessage) {
                    var renderedBanner = template(messageTemplate, data);
                    var messageShown = new Message(message.code, {
                        pinOnHide: false,
                        siteMessageLinkName: 'membership message',
                        siteMessageCloseBtn: 'hide',
                        siteMessageComponentName: message.campaign,
                        trackDisplay: true,
                        cssModifierClass: cssModifierClass
                    }).show(renderedBanner);
                    if (messageShown) {
                        mediator.emit('membership-message:display');
                    }
                }
            });
        }

        var completer = function (complete) {
            mediator.on('membership-message:display', function () {
                bean.on(qwery('#membership__engagement-message-link')[0], 'click', complete);
            });
        };

        this.variants = [
            {
                id: 'membership',
                test: function () {

                    var membershipEndpoints = {
                        UK: 'https://membership.theguardian.com/supporter',
                        US: 'https://membership.theguardian.com/us/supporter',
                        AU: 'https://membership.theguardian.com/au/supporter',
                        INT: 'https://membership.theguardian.com/supporter'
                    };

                    function formatEndpointUrl(edition, message) {
                        return membershipEndpoints[edition] + '?INTCMP=' + message.campaign;
                    }

                    var messages = {
                        UK: {
                            campaign: 'MEMBERSHIP_SUPPORTER_BANNER_UK',
                            // increment the number at the end of the code to redisplay banners
                            // to everyone who has previously closed them
                            code: 'membership-message-uk-2016-06-24',
                            data: {
                                messageText: 'The Guardian’s voice is needed now more than ever. Support our journalism for just £49 per year.'
                            }
                        },
                        US: {
                            campaign: 'MEMBERSHIP_SUPPORTER_BANNER_US',
                            code: 'membership-message-us-2016-06-24',
                            data: {
                                messageText: 'Support open, independent journalism. Become a Supporter for just $4.99 per month.'
                            }
                        },
                        AU: {
                            campaign: 'MEMBERSHIP_SUPPORTER_BANNER_AU',
                            code: 'membership-message-au-2016-08-01',
                            data: {
                                messageText: 'We need you to help support our fearless independent journalism. Become a Guardian Australia Member for just $100 a year.'
                            }
                        },
                        INT: {
                            campaign: 'MEMBERSHIP_SUPPORTER_BANNER_INT',
                            code: 'membership-message-int-2016-06-24',
                            data: {
                                messageText: 'The Guardian’s voice is needed now more than ever. Support our journalism for just $49/€49 per year.'
                            }
                        }
                    };

                    var colours = {
                        1: 'vibrant-blue',
                        2: 'yellow',
                        3: 'light-blue',
                        4: 'deep-purple',
                        5: 'teal'
                    };


                    var message = messages[config.page.edition];
                    if (message) {
                        // Rotate through six different colours on successive page views
                        var colour = storage.local.get('gu.alreadyVisited') % 6;
                        var cssModifierClass = 'membership-message';

                        // 0 leaves it as the default colour set by the base class
                        if (colour) {
                            cssModifierClass += ('-' + colours[colour]);
                        }

                        var data = defaults({linkHref: formatEndpointUrl(config.page.edition, message)}, message.data, defaultData);

                        showMessageIfAsyncChecksPermit(message, data, cssModifierClass);
                    }
                },
                success: completer
            },
            {
                id: 'contributions',
                test: function () {
                    var message ={
                        campaign: 'CONTRIBUTIONS_ENGAGEMENT_BANNER',
                            // increment the number at the end of the code to redisplay banners
                            // to everyone who has previously closed them
                            code: 'contributions-engagement-banner-2016-08-08',
                        data: {
                            messageText: 'If you use it, if you like it, why not pay for it? It\'s only fair. Contribute to the Guardian.'
                        }
                    };

                    var data = defaults({linkHref: 'https://contribute.theguardian.com/uk?INTCMP='+message.campaign}, message.data, defaultData);
                    showMessageIfAsyncChecksPermit(message, data, 'contributions-message');
                },
                success: completer
            }
        ];
    };
});
