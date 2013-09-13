define(['bonzo', 'modules/popular'], function (bonzo, popular) {

    return function () {

        var _config;

        this.id = 'MostPopularFromFacebook';
        this.expiry = '2013-09-30';
        this.audience = 0.5;
        this.description = 'Tests whether showing Most Popular for visitors referred from Facebook to visitors referred from Facebook increases clickthrough';
        this.canRun = function (config) {
            _config = config;

            var isArticle = config.page && config.page.contentType === "Article",
                isFromFacebook = document.referrer.indexOf('www.facebook.com') != -1;

            return isArticle && isFromFacebook;
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
                    var $jsPopularEl = bonzo(context.querySelector('.js-popular'));

                    $jsPopularEl.hide();
                    $jsPopularEl.after('<div class="js-popular-facebook"></div>');

                    popular(_config, context, false, '/most-read-facebook', '.js-popular-facebook');
                }
            }
        ];
    };

});
