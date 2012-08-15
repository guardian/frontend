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

            // load fonts
            var fileFormat = (navigator.userAgent.toLowerCase().indexOf('android') > -1) ? 'ttf' : 'woff';
            var fontStyleNodes = document.querySelectorAll('[data-cache-name].initial');
            new Fonts(fontStyleNodes, fileFormat).loadFromServerAndApply();

            // todo: make this a proper test around page metadata not the existence of divs
            var hasStoryPackage = !document.getElementById('js-related');

            if (!hasStoryPackage) {
                var relatedUrl = config.page.coreNavigationUrl + '/related/UK/' + config.page.pageId;
                new Related(document.getElementById('js-related')).load(relatedUrl);
            }
        }
    }

});
