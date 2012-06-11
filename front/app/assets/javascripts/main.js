require([
    guardian.js.modules.commonPlugins, 
    guardian.js.modules.topNav], function(common, topNav){
});

//lower priority modules
require([
    guardian.js.modules.trailExpander, 
    guardian.js.modules.mostPopular, 
    guardian.js.modules["$g"]
    ], 
    function(trailExpander, mostPopular, $g) {
        
        trailExpander.init();

//        // todo: make items return in sequence
//        var sectionsToShow = [
//            'technology',
//            'sport',
//            'football'
//        ];
//
//        var sectionsToShow = 'item=' + sectionsToShow.join('&item=');
//
//        var url = 'http://simple-navigation.appspot.com/trailblocks.json?' + sectionsToShow + '&num-items=3';
//
//        var placeholder = document.getElementById('foo');
//
//        mostPopular.fetchContent(url, {
//            isNested: true,
//            elm: placeholder,
//            limit: 4
//        });

        // set up tests for placement of "more on story" packages
        var urlParams = $g.getUrlVars();
        if(urlParams.moreMode) {

            var moreClass = 'more-on-story zone-border ';

            switch(urlParams.moreMode) {
                case "inline":
                    var newClass = 'more-inline';
                    moreClass += newClass + ' show-3';
                    break;
                case "singleBlock":
                    var newClass = 'more-single-block';
                    moreClass += newClass + ' show-1';
                    break;
                case "multipleBlock":
                    var newClass = 'more-multiple-block';
                    moreClass += newClass + ' show-1';
                    break;
                default:
                    localStorage.removeItem("moreMode");
                    break;
            }

            localStorage.setItem("moreMode", moreClass);
        }

    }
);