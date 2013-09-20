define(['common', 'bonzo', 'modules/popular'], function (common, bonzo, popular) {

    return function () {

        var _config;

        this.id = 'MostPopularFromFacebook';
        this.expiry = '2013-09-30';
        this.audience = 0.5;
        this.description = 'Tests whether showing Most Popular for visitors referred from Facebook to visitors referred from Facebook increases clickthrough';
        this.events = ['most popular'];
        this.canRun = function (config) {
            _config = config;

            var isArticle = config.page && config.page.contentType === "Article",
                isFromFacebook = document.referrer.indexOf('facebook.com') !== -1,
                isDev = config.page.isDev;

            return isArticle && (isFromFacebook || isDev);
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                    return true;
                }
            },
            {
                id: 'global-links',
                test: function () {
                    common.mediator.on('modules:popular:loaded', function (container) {
                        var tabs = container.querySelectorAll('.tabs__tab');

                        bonzo(tabs).removeClass('tabs__tab--selected');
                        bonzo(tabs[1]).addClass('tabs__tab--selected');

                        container.querySelector('#tabs-popular-1').style.display = 'none';
                        container.querySelector('#tabs-popular-2').style.display = 'block';
                    });
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
