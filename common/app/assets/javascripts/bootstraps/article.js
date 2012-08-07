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

            // load fonts
            var fonts = new Fonts();

            // TODO: Put fontServer in config object.
            var fontServer = 'http://guardian-fonts.s3-external-3.amazonaws.com/';
            window.addEventListener('load', function() {
                fonts.loadFromServer(fontServer);
            }, true);
        }
    }

});
