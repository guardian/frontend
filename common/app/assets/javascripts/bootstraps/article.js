define(['modules/related', 'modules/image', 'modules/popular', 'modules/fonts'], function(Related, Image, Popular, Fonts){

    return {
        init: function(config) {
            
            // upgrade images
            new Image().upgrade();

            // most popular
            var popularUrl = config.page.coreNavigationUrl + '/most-popular/UK/' + config.page.section;
            new Popular(document.getElementById('popular')).load(popularUrl);
            
            // load related
            var relatedUrl = config.page.coreNavigationUrl + '/related/UK/' + config.page.pageId;
            new Related(document.getElementById('related')).load(relatedUrl);

            // Load fonts, cache, and apply them.
            new Fonts().loadFromServerAndApply();

            /*
            // Wait till other downloads finished (load?), and then cache
            // the fonts for the next page view.
            window.addEventListener('load', function() {
                new Fonts().loadFromServer('http://guardian-fonts.s3-external-3.amazonaws.com/');
            }, true);
            */
        }
    }

});
