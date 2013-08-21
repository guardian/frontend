define([
    'common',
    'modules/detect',
    'modules/experiments/left-hand-card'
],
function (
    common,
    detect,
    Card
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
                test: function () {
                    var card = new Card({
                        type: 'internal'
                    });
                }
            }
        ];
    };

    return ExperimentInlineLinkCard;

});
