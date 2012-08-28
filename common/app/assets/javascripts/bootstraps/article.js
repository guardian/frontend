define(['common', 'modules/related', 'modules/images', 'modules/popular', 'modules/expandable', 'vendor/ios-orientationchange-fix', 'modules/relativedates', 'modules/tabs', 'qwery'],
    function(common, Related, Images, Popular, Expandable, Orientation, RelativeDates, Tabs, qwery) {

    return {
        init: function(config) {

            // upgrade images
            var imgs = new Images();
            imgs.upgrade();

            var popularContainer = document.getElementById('js-popular');

            // load most popular
            var popularUrl = config.page.coreNavigationUrl + '/most-popular/UK/' + config.page.section;
            new Popular(popularContainer).load(popularUrl);

            // load related or story package
            var hasStoryPackage = !document.getElementById('js-related');
            
            var relatedExpandable = new Expandable({ id: 'related-trails', expanded: false });

            if (hasStoryPackage) {
                relatedExpandable.initalise();
            } else { 
                common.mediator.on('modules:related:render', relatedExpandable.initalise);
                var relatedUrl = config.page.coreNavigationUrl + '/related/UK/' + config.page.pageId;
                new Related(document.getElementById('js-related')).load(relatedUrl);
            }

            // show relative dates
            RelativeDates.init();

            // load tabs and initialise any already in the document
            var tabs = new Tabs();
            tabs.init();

             // loop through child tabbed elements and bind them as expanders
            common.mediator.on('modules:popular:render', function(){
                
                // activate tabbed widget
                common.mediator.emit('modules:tabs:render', '#js-popular-tabs');

                // activate multiple expanders
                var popularExpandables = qwery('.trailblock', popularContainer);
                for (var i in popularExpandables) {
                    var pop = popularExpandables[i];
                    var popularExpandable = new Expandable({ id: pop.id, expanded: false });
                    common.mediator.on('modules:popular:render', popularExpandable.initalise);
                }
            });
        }
    }
});