define([
        'common/utils/detect',
        'common/utils/template',
        'common/modules/ui/message',
        'text!common/views/viewability-feedback.html'
    ],
    function (
        detect,
        template,
        Message,
        viewabilityFeedbackTemplate
    ) {
        return function () {
        this.id = 'Viewability';
        this.start = '2015-06-15';
        this.expiry = '2015-08-01';
        this.author = 'Steve Vadocz';
        this.description = 'Viewability - Includes whole viewability package: ads lazy loading, sticky header, sticky MPU, spacefinder 2.0, dynamic ads, ad next to comments';
        this.audience = 0.1;
        this.audienceOffset = 0.5;
        this.successMeasure = '';
        this.audienceCriteria = 'Audience from all editions';
        this.dataLinkNames = '';
        this.idealOutcome = 'Increased user engagement and commercial viewability';

        this.canRun = function () {
            return true;
        };

        var showMessage = function (panelLinks) {
            new Message('save-for-later', {
                pinOnHide: false
            }).show(template(
                    viewabilityFeedbackTemplate,
                    {
                        panelLink: panelLinks[detect.getBreakpoint()],
                        messageTextHeader: 'Tell us about your experience using the Guardian site',
                        messageText: 'Complete a quick survey (5 min) and get involved in the development of the site.',
                        linkText: 'Open survey'
                    }
                ));
        };


        this.variants = [
            {
                id: 'control',
                test: function () {
                    var panelLinks = {
                        mobile: 'https://s.userzoom.com/m/MyBDMTBTMjMy',
                        tablet: 'https://s.userzoom.com/m/MiBDMTBTMjMy',
                        desktop: 'https://s.userzoom.com/m/MSBDMTBTMjMy',
                        wide: 'https://s.userzoom.com/m/MSBDMTBTMjMy'
                    };

                    showMessage(panelLinks);
                }
            },
            {
                id: 'variant',
                test: function () {
                    var panelLinks = {
                        mobile: 'https://s.userzoom.com/m/MyBDMTBTMjMx',
                        tablet: 'https://s.userzoom.com/m/MiBDMTBTMjMx',
                        desktop: 'https://s.userzoom.com/m/MSBDMTBTMjMx',
                        wide: 'https://s.userzoom.com/m/MSBDMTBTMjMx'
                    };

                    showMessage(panelLinks);
                }
            }
        ];
    };
    }
);
