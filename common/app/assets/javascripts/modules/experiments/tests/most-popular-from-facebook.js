define(['facebook'], function (facebook) {

    return function () {

        this.id = 'MostPopularFromFacebook';
        this.expiry = '2013-09-30';
        this.audience = 0.5;
        this.description = 'Tests whether showing Most Popular for visitors referred from Facebook to visitors referred from Facebook increases clickthrough';
        this.canRun = function (config) {
            return (config.page && config.page.contentType === "Article") ? true : false;
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                    return true;
                }
            },
            {
                id: 'facebook',
                test: function (context) {
                    facebook(context.querySelector('#mostpopular')).hide();
                    facebook(context.querySelector('#mostpopular-fb')).show();
                }
            }
        ];
    };

});
