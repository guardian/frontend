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

        // set up tests for placement of "more on story" packages
        var urlParams = $g.getUrlVars();

        if(urlParams.mode) {
            var mode = parseInt(urlParams.mode);
            if (mode >= 1 && mode <= 6) { // limit to our 6 test cases for now
                localStorage.setItem("moreMode", mode);
            } else { // anything else resets it
                localStorage.removeItem("moreMode");
            }
        }

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
                limit: 2
            });
        }
        
    }
);