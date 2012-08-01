define(['modules/related', 'modules/upgradeImages', 'modules/popular'], function(Related, Images, Popular){

    return {
        init: function(config) {
            
            // upgrade images
            new Images().upgrade();

            // most popular
            var popularUrl = config.page.coreNavigationUrl + '/most-popular/UK/' + config.page.pageId;
            new Popular(document.getElementById('popular')).load(popularUrl);
            
            // load related
            var relatedUrl = config.page.coreNavigationUrl + '/related/UK/' + config.page.pageId;
            new Related(document.getElementById('related')).load(relatedUrl);

            return true;
        }
    }

});
