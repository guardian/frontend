define(['modules/related', 'modules/images', 'modules/popular', 'modules/expandable'], function(Related, Images, Popular, Expandable){

    return {
        init: function(config) {

            // expandable
            new Expandable({ id: 'related-trails', expanded: false });

            // upgrade images
            new Images().upgrade();

            // most popular
            var popularUrl = config.page.coreNavigationUrl + '/most-popular/UK/' + config.page.section;
            new Popular(document.getElementById('js-popular')).load(popularUrl);
            
            // load related
            // todo: make this a proper test around page metadata not the existence of divs
            var hasStoryPackage = !document.getElementById('js-related');

            if (!hasStoryPackage) {
                var relatedUrl = config.page.coreNavigationUrl + '/related/UK/' + config.page.pageId;
                new Related(document.getElementById('js-related')).load(relatedUrl);
            }
        }
    }

});
