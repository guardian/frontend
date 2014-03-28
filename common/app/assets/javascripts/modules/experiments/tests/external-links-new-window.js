define([
    'common/$'
], function(
    $
) {
    var openInBodyLinksInSameWindow = function() {
        $('[data-link-name="in body link"]').attr('target', '_self');
    };

    var ExternalLinksNewWindow = function() {

        this.id = 'ExternalLinksNewWindow';
        this.start = '2014-03-28';
        this.expiry = '2014-04-28';
        this.author = 'Kaelig';
        this.description = 'Open external links in a new window.';
        this.audience = 0.2;
        this.audienceOffset = 0;
        this.successMeasure = 'Dwell time and page views.';
        this.audienceCriteria = 'Users viewing an article.';
        this.dataLinkNames = 'in body link';
        this.idealOutcome = 'Page views and dwell time increases on the site as a whole.';

        this.canRun = function(config) {
            return config.page.contentType === 'Article';
        };

        this.variants = [
            {
                id: 'control',
                test: function(context) {
                    openInBodyLinksInSameWindow(context);
                }
            },
            {
                id: 'new-window',
                test: function() {}
            }
        ];

        this.notInTest = function(context) {
            openInBodyLinksInSameWindow(context);
        };
    };

    return ExternalLinksNewWindow;

});