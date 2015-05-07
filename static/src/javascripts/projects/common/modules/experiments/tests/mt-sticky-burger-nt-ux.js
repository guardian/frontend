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
        this.id = 'MtStBurgerNtUx';
        this.start = '2015-05-05';
        this.expiry = '2015-05-10';
        this.author = 'Zofia Korcz';
        this.description = 'Top navigation and top ad slot are sticky with navigation going to slim mode for UX testing - variant with no threshold';
        this.audience = 0.0;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'Internal only - we opt in';
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
                    stickyNav.stickyNavBurgerNoThr();
                }
            }
        ];
    };
});
