//requirejs.config({
    //paths: guardian.js.modules
//});

// High priority modules
require([guardian.js.modules.detect, guardian.js.modules.topNav],
    function(detect, topNav) {

    }
);

require([guardian.js.modules.commonPlugins], function(common){});

// lower priority modules
require([guardian.js.modules.trailblockGenerator, 
    guardian.js.modules.expanderBinder,
    guardian.js.modules["$g"],
    "bonzo",
    "bean",
    guardian.js.modules.detect],
    function(trailblockGenerator, expanderBinder, $g, bonzo, bean, detect){

        expanderBinder.init();

        var urlParams = $g.getUrlVars();

        // begin more-on-story tests
        
        /*
        $g.onReady(function(){

            // swap out the related items if mode is base
            if ( localStorage.getItem("moreMode") && detect.getLayoutMode() != 'extended') {

                var newClass = localStorage.getItem("moreMode");

                var paragraphToInsertAfter = document.querySelectorAll('article p')[4];
                var related = document.getElementById('js-expandable-related');

                // this is somewhat ugly. we need to remove the show-4 or whatever
                // class from most popular as it's a variable so we don't know what it is.
                // we can't just add more classes (.show-3 .show-5 etc) as specificity fails.
                var regex = /show-\d+/g;
                var classnames = related.className;
                related.className = classnames.replace(regex, '');

                bonzo(related).addClass(newClass).insertAfter(paragraphToInsertAfter);
            }
        });

        */

        // initialise event listener for trail expanders
        guardian.js.ee.emit('addExpander', $g.qs('#js-expandable-related'));

        /* ########### fetch most popular for section ########### */

        var endPoint = 'http://simple-navigation.appspot.com/most-popular/section/' + guardian.page.section;
        //var header =  guardian.page.section + ' most read';
        var header = null;
        if (document.referrer && document.referrer.toLowerCase().indexOf('facebook.com') > -1) {
            endPoint = 'http://simple-navigation.appspot.com/most-popular/facebook';
            header = 'Most read on Facebook';
        }

        trailblockGenerator.fetchContent(endPoint, {
            isShaded: true,
            header: header,
            limit: 5
        });
        
        /* ########### fetch related content by tags ########### */
        
        // todo: limit to 10 tags max
        var tags = '?tag=' + guardian.page.tagIds.replace(/,/g, '&tag=') + '&ignore=' + guardian.page.pageId;
        var moreOnTagsUrl = 'http://simple-navigation.appspot.com/munge-latest.json';
        var tagUrl = moreOnTagsUrl + tags;

        var placeholder = document.getElementById('tier3-2');

        trailblockGenerator.fetchContent(tagUrl, {
            isShaded: false,
            limit: 5,
            mode: 'nestedSingle',
            elm: placeholder,
            header: 'Related content by tags'
        });
        
    }
);