define(['common', 'bonzo', 'modules/popular', 'modules/storage'], function (common, bonzo, popular, storage) {

    return function () {

        var _config;

        this.id = 'MostPopularFromFacebook';
        this.expiry = '2013-10-08';
        this.audience = 0.5;
        this.description = 'Tests whether showing Most Popular for visitors referred from Facebook to visitors referred from Facebook increases clickthrough';
        this.events = ['most popular'];
        this.canRun = function (config) {
            _config = config;

            var isArticle = config.page && config.page.contentType === "Article",
                isFromFacebook = document.referrer.indexOf('facebook.com') !== -1,
                hasBeenFromFacebook = storage.get('gu.ab.participations')[this.id],
                isTest = /#dev-fbpopular/.test(window.location.hash);

            return isArticle && (isFromFacebook || hasBeenFromFacebook || isTest);
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
                        var classes = 'tabs__tab--selected tone-colour tone-accent-border';

                        bonzo(tabs).removeClass(classes);
                        bonzo(tabs[1]).addClass(classes);

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
                    $jsPopularEl.after('<div class="js-popular-facebook article__popular"></div>');

                    popular(_config, context, false, '/most-read-facebook', '.js-popular-facebook');
                }
            },
            {
                id: 'fb-label',
                test: function (context) {
                    var $jsPopularEl = bonzo(context.querySelector('.js-popular'));

                    $jsPopularEl.hide();
                    $jsPopularEl.after('<div class="js-popular-facebook article__popular"></div>');

                    popular(_config, context, false, '/most-read-facebook', '.js-popular-facebook');

                    common.mediator.on('modules:popular:loaded', function () {
                        context.querySelector('.js-popular-facebook #most-read-head').innerHTML = "Most read from Facebook";
                    });
                }
            }
        ];
    };

});
