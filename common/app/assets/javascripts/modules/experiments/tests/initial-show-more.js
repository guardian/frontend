define([], function() {

    return function() {

        this.id = 'InitialShowMore';
        this.expiry = '2013-11-30';
        this.audience = 1;
        this.description = 'Test how many items to initially show in the news container';
        this.canRun = function(config) {
            return config.page.contentType === 'Network Front';
        };
        this.variants = [
//            {
//                id: 'control',
//                test: function () {
//                    return true;
//                }
//            },
            {
                id: 'initial-show-more',
                test: function (context) {
                }
            }
        ];
    };

});
