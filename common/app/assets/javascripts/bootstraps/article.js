define(['common', 'modules/related', 'modules/images', 'modules/popular', 'modules/expandable',
    'vendor/ios-orientationchange-fix', 'modules/relativedates', 'modules/navigation'],
    function(common, Related, Images, Popular, Expandable, Orientation, RelativeDates, Navigation) {

    return {
        init: function(config) {

            // upgrade images
            new Images().upgrade();

            // load most popular
            var popularUrl = config.page.coreNavigationUrl + '/most-popular/UK/' + config.page.section;
            new Popular(document.getElementById('js-popular')).load(popularUrl);

            // load related or story package
            var hasStoryPackage = !document.getElementById('js-related');
            
            var relatedExpandable = new Expandable({ id: 'related-trails', expanded: false });

            var coreNavigationHost = config.page.coreNavigationUrl;

            if (hasStoryPackage) {
                relatedExpandable.initalise();
            } else { 
                common.mediator.on('modules:related:render', relatedExpandable.initalise);
                var relatedUrl = coreNavigationHost + '/related/' + config.page.edition + '/' + config.page.pageId;
                new Related(document.getElementById('js-related')).load(relatedUrl);
            }

            var latestUrl = coreNavigationHost + '/section/latest/' + config.page.edition + '/' + config.page.section;
            new Navigation().load(latestUrl);

            // show relative dates
            RelativeDates.init();
        }
    }
});