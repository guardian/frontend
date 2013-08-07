define(['common', 'modules/detect'], function (common, detect) {

    var InlineLinkCard = function () {

        this.id = 'InlineLinkCard';
        this.expiry = '2013-08-21';
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
                    common.$g('body').addClass('test-link-card--on');
                }
            }
        ];
    };

    return InlineLinkCard;

});
