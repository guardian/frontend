define(['common'], function (common) {

    var ExpandableTrails = function () {

        this.id = 'ExpandableTrails';
        this.expiry = '2013-08-29';
        this.audience = 0.1;
        this.description = 'Impact of expandable trails on page views';
        this.canRun = function(config) {
            return config.page.contentType === 'Article';
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                   return true;
                }
            },
            {
                id: 'expandable-trails',
                test: function () {
                    common.$g('body').addClass('ab-expandable-trails--on');
                }
            }
        ];
    };

    return ExpandableTrails;

});
