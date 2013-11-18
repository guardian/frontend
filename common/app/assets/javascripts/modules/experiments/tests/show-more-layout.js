define(['$'], function($) {

    return function() {

        this.id = 'ShowMoreLayout';
        this.expiry = '2013-11-30';
        this.audience = 0.2;
        this.description = 'Test how many items to initially show in the news container';
        this.canRun = function(config) {
            return config.page.contentType === 'Network Front';
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                    return true;
                }
            },
            {
                id: 'repeat',
                test: function (context) {
                    $('.collection', context)
                        .removeClass('collection--show-more-standard')
                        .addClass('collection--show-more-repeat');
                }
            }
        ];
    };

});
