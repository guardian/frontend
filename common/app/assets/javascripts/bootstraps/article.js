define(['modules/related', 'modules/images', 'modules/popular', 'modules/fonts'], function(Related, Images, Popular, Fonts){

    return {
        init: function(config) {
            
            // upgrade images
            new Images().upgrade();

            // most popular
            var popularUrl = config.page.coreNavigationUrl + '/most-popular/UK/' + config.page.section;
            new Popular(document.getElementById('js-popular')).load(popularUrl);
            
            // load related
            var relatedUrl = config.page.coreNavigationUrl + '/related/UK/' + config.page.pageId;
            new Related(document.getElementById('related')).load(relatedUrl);


            // Load fonts, cache, and apply them.
            var fileFormat = 'woff';
            if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
                fileFormat = 'ttf';
            }
            new Fonts(fileFormat).loadFromServerAndApply();

            /*
            // Wait till other downloads finished (load?), and then cache
            // the fonts for the next page view.
            window.addEventListener('load', function() {
                new Fonts(fileFormat).loadFromServer('http://guardian-fonts.s3-external-3.amazonaws.com/');
            }, true);
            */

            // todo: make this a proper test around page metadata not the existence of divs
            var hasStoryPackage = !document.getElementById('js-related');

            if (!hasStoryPackage) {
                var relatedUrl = config.page.coreNavigationUrl + '/related/UK/' + config.page.pageId;
                new Related(document.getElementById('js-related')).load(relatedUrl);
            }
        }
    }

});
