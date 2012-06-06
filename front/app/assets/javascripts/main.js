require([
    guardian.js.modules.commonPlugins, 
    guardian.js.modules.topNav], function(common, topNav){
});

//lower priority modules
require([guardian.js.modules.trailExpander, guardian.js.modules.mostPopular],
    function(trailExpander, mostPopular) {
        
        trailExpander.bindExpanders();

        // todo: make items return in sequence
        var sectionsToShow = [
            'technology',
            'sport',
            'football'
        ];

        var sectionsToShow = 'item=' + sectionsToShow.join('&item=');

        var url = 'http://simple-navigation.appspot.com/trailblocks.json?' + sectionsToShow + '&num-items=3';

        var placeholder = document.getElementById('foo');

        mostPopular.fetchContent(url, {
            isNested: true,
            elm: placeholder
        });

    }
);