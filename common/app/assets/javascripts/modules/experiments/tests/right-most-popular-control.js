define([
    'utils/detect'
], function(
    detect
    ) {

    return function() {

        this.id = 'RightPopularControl';
        this.expiry = '2013-12-31';
        this.audience = 0.05;
        this.audienceOffset = 0.55;
        this.description = 'Control group for right most popular test';
        this.canRun = function(config) {
            return (detect.getBreakpoint() === 'wide' || detect.getBreakpoint() === 'desktop') && config.page.contentType === 'Article';
        };
        this.variants = [
            {
                id: 'Control',
                test: function () { }
            }
        ];
    };
});
