define(function () {

    var ExperimentExpandableTrails = function () {

        this.id = 'ExpandableTrails';
        this.expiry = '2013-08-29';
        this.audience = 1;
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
                    document.body.className += ' ab-expandable-trails--on';
                }
            }
        ];
    };

    return ExperimentExpandableTrails;

});
