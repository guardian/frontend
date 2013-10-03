define([
    'common',
    'modules/detect',
    'modules/userPrefs',
    'modules/experiments/left-hand-card'
],
function (
    common,
    detect,
    userPrefs,
    LeftHandCard
) {

    var ExperimentInlineLinkCard = function () {

        this.id = 'InlineLinkCard';
        this.expiry = '2013-09-30';
        this.audience = 1;
        this.description = 'Impact of cardifying inline links on number of linked stories read';
        this.canRun = function(config) {
            var layoutMode = detect.getLayoutMode();
            return config.page.contentType === 'Article' && layoutMode === 'extended';
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                   return true;
                }
            },
            {
                id: 'link-card',
                test: function (config, context) {
                    common.mediator.on('page:article:ready', function(config, context) {
                        if (!config.switches.externalLinksCards) {
                            var options = {
                                    origin: 'internal',
                                    context: context
                                };
                            if (config.page.isLiveBlog) {
                                options.linksHolders = '.block-elements > p';
                            }
                            var card = new LeftHandCard(options);
                        }
                    });
                }
            },
            {
                id: 'link-card-all-origins',
                test: function (config, context) {
                    common.mediator.on('page:article:ready', function(config, context) {
                        if (!config.switches.externalLinksCards) {
                            var options = {
                                    origin: 'all',
                                    context: context
                                };
                            if (config.page.isLiveBlog) {
                                options.linksHolders = '.block-elements > p';
                            }
                            var card = new LeftHandCard(options);
                        }
                    });
                }
            }
        ];
    };

    return ExperimentInlineLinkCard;

});
