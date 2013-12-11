define([
    "modules/onward/sequence",
    "modules/experiments/highlight-panel",
    'utils/mediator'
], function(
    sequence,
    HighlightPanel,
    mediator
    ) {

    var rendered = false;

    return function() {

        this.id = 'OnwardHighlightsPanel';
        this.expiry = '2013-12-30';
        this.audience = 0.1;
        this.audienceOffset = 0.6;
        this.description = 'Test whether an onward highlights panel increases page views per session';
        this.canRun = function(config) {
            return config.page.contentType === 'Article';
        };
        this.variants = [
            {
                id: 'Highlights',
                test: function (context, config) {

                    mediator.on('modules:sequence:loaded', function(data){
                        if (data !== null && !rendered) {
                            var h = new HighlightPanel(data.items, mediator);
                            rendered = true;
                        }
                    });

                    sequence.init('/' + config.page.pageId);
                }
            }
        ];
    };
});
