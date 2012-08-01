define(['modules/related', 'modules/image', 'modules/popular'], function(Related, Image, Popular){

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

            return true;
        }
    }

});
