define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/ui/message',
    'common/modules/navigation/sticky-nav',
    'text!common/views/invite-to-panel.html'
], function (
    fastdom,
    $,
    _,
    config,
    detect,
    mediator,
    template,
    Message,
    stickyNav,
    inviteToPanelTemplate
) {
    return function () {
        this.id = 'MtRec2';
        this.start = '2015-05-12';
        this.expiry = '2015-06-16';
        this.author = 'Steve Vadocz';
        this.description = 'Viewability results - Recommendation option 2';
        this.audience = 0.02;
        this.audienceOffset = 0.3;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US and UK edition';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.showForSensitive = false;

        this.canRun = function () {
            var isIE = detect.getUserAgent.browser === 'MSIE' || detect.getUserAgent === 'IE 11';

            return !isIE && _.contains(['UK', 'US'], config.page.edition);
        };

        this.showMessage = function (id, linkName, panelLinks) {
            new Message(id, {
                pinOnHide: false,
                siteMessageLinkName: linkName,
                siteMessageCloseBtn: 'hide'
            }).show(template(
                    inviteToPanelTemplate,
                    {
                        panelLink: panelLinks[detect.getBreakpoint()],
                        messageTextHeader: 'Tell us about your experience using the Guardian site',
                        messageText: 'Complete a quick survey (5 mins max) and get involved in the development of the site.',
                        linkText: 'Open survey'
                    }
                ));
        };

        this.fireRecTest = function () {
            var panelLinks = {
                mobile: 'https://s.userzoom.com/m/NiBDMTBTMjE1',
                tablet: 'https://s.userzoom.com/m/NSBDMTBTMjE1',
                desktop: 'https://s.userzoom.com/m/NCBDMTBTMjE1',
                wide: 'https://s.userzoom.com/m/NCBDMTBTMjE1'
            };

            stickyNav.stickySlow.init(2);

            if (!detect.adblockInUse) {
                this.showMessage('panelMtRec2', 'panel message mtRec2 variant', panelLinks);
            }
        };

        /**
         * nothing happens in here, we just use this to bucket users
         */
        this.variants = [
            {
                id: 'A',
                test: function () { }
            },
            {
                id: 'B',
                test: function () {
                    var panelLinks = {
                        mobile: 'https://s.userzoom.com/m/OSBDMTBTMjE4',
                        tablet: 'https://s.userzoom.com/m/OCBDMTBTMjE4',
                        desktop: 'https://s.userzoom.com/m/NyBDMTBTMjE4',
                        wide: 'https://s.userzoom.com/m/NyBDMTBTMjE4'
                    };

                    if (!detect.adblockInUse) {
                        this.showMessage('panelMtRec2', 'panel message mtRec2 control', panelLinks);
                    }
                }.bind(this)
            }
        ];
    };

});
