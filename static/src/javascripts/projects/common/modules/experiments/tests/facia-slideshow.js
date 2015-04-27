define([
    'common/utils/detect'
], function (
    detect
) {
    return function () {
        this.id = 'FaciaSlideshow';
        this.start = '2015-04-27';
        this.expiry = '2015-05-21';
        this.author = 'John Duffell';
        this.description = 'Testing to see if slideshows affect page views per visit.';
        this.audience = 0.3;
        this.audienceOffset = 0.1;
        this.successMeasure = 'Page views per visit are maintained.';
        this.audienceCriteria = 'All users not on mobile';
        this.dataLinkNames = '';
        this.idealOutcome = 'Pages per visit improves';
        this.showForSensitive = false;

        this.canRun = function () {
            return detect.getBreakpoint() !== 'mobile';
        };

        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'slideshow',
                test: function () { }
            }
        ];
    };

});
