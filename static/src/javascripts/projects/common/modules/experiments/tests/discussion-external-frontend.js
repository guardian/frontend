define([], function () {
    return function () {

        this.id = 'DiscussionExternalFrontend';
        this.start = '2016-08-14';
        this.expiry = '2016-09-30';
        this.author = 'Fabio Crisci';
        this.description = 'Load discussion frontend from an external location';
        this.audience = 0;
        this.audienceOffset = 0.0;
        this.successMeasure = '';
        this.showForSensitive = true;
        this.audienceCriteria = 'Modern browsers only';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return 'fetch' in window && 'Promise' in window &&
                window.curlConfig.paths['discussion-frontend-react'] &&
                window.curlConfig.paths['discussion-frontend-preact'];
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: function () {}
            },
            {
                id: 'react',
                test: function () {},
                success: function () {}
            },
            {
                id: 'preact',
                test: function () {},
                success: function () {}
            }
        ];
    };
});
