//requirejs.config({
    //paths: guardian.js.modules
//});

//High priority modules
require([guardian.js.modules.detect, guardian.js.modules.topNav, "bean", "bonzo"],
    function(detect, bean, bonzo) {

        // swap out the related items if mode is base
        if (detect.getLayoutMode() == 'base') {
            var paragraphToInsertAfter = document.querySelectorAll('article p')[4];
            var related = document.getElementById('js-expandable-related');
            bonzo(related).insertAfter(paragraphToInsertAfter);
        }

    });

require([guardian.js.modules.commonPlugins], function(common){});

//lower priority modules
require([guardian.js.modules.mostPopular, 
    guardian.js.modules.trailExpander],
    function(mostPopular, trailExpander){

        var endPoint = 'http://simple-navigation.appspot.com/most-popular/section/' + guardian.page.section;
        var header = 'Popular right now';
        if (document.referrer && document.referrer.toLowerCase().indexOf('facebook.com') > -1) {
            endPoint = 'http://simple-navigation.appspot.com/most-popular/facebook';
            header = 'Popular right now on Facebook';
        }

        mostPopular.fetchContent(false, true, endPoint, header);

        trailExpander.bindExpanders();
    }
);