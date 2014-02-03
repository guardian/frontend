define([
    'common/utils/detect'
], function(
    detect
    ) {

    var rendered = false;

    return function() {

        this.id = 'OnwardInlineElements';
        this.expiry = '2014-2-28';
        this.audience = 0.2;
        this.audienceOffset = 0.0;
        this.description = 'Test whether inlining elements of the story package improves page views per session.';
        this.canRun = function(config) {
            return detect.getBreakpoint() !== 'mobile' && config.page.contentType === 'Article';
        };
        this.variants = [
            {
                id: 'inlineElements',
                test: function (context, config) {
                }
            },
            {
                id: 'control',
                test: function (context, config) {

                }
            }
        ];
    };
});
