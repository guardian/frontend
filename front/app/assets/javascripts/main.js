require([
    guardian.js.modules.commonPlugins, 
    guardian.js.modules.topNav], function(common, topNav){
});

//lower priority modules
require([
    guardian.js.modules.expanderBinder, 
    guardian.js.modules.trailblockGenerator,
    guardian.js.modules["$g"]
    ],
    function(expanderBinder, trailblockGenerator, $g) {
        
        expanderBinder.init();

        // bind the expanders
        var expanders = $g.qsa('.trailblock');
        guardian.js.ee.emit('addExpander', expanders);

        // currently unused
        function fetchExtraSections() {
        
            // todo: make items return in sequence
            var sectionsToShow = [
                'technology',
                'sport',
                'football'
            ];

            var sectionsToShow = 'item=' + sectionsToShow.join('&item=');

            var url = 'http://simple-navigation.appspot.com/trailblocks.json?' + sectionsToShow + '&num-items=3';

            var placeholder = document.getElementById('foo');

            trailblockGenerator.fetchContent(url, {
                mode: 'nestedMultiple',
                elm: placeholder,
                limit: 2,
                componentAnalyticsName: 'front sections'
            });
        }
        
    }
);