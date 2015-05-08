define([
    'bonzo',
    'qwery',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/navigation/sticky-nav'
], function (
    bonzo,
    qwery,
    detect,
    config,
    mediator,
    stickyNav
) {

    return function () {
        this.id = 'MtStAllNtUx';
        this.start = '2015-05-01';
        this.expiry = '2015-05-15';
        this.author = 'Steve Vadocz';
        this.description = 'Top navigation and top ad slot are sticky with navigation going to slim mode for UX testing version B';
        this.audience = 0.0;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'Interal only - we opt in';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.showForSensitive = false;

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'A',
                test: function () {
                    stickyNav.stickySlow.init();
                }
            }
        ];
    };
});
