//requirejs.config({
    //paths: guardian.js.modules
//});

//High priority modules
require([guardian.js.modules.detect, guardian.js.modules.topNav, "bean", "bonzo", guardian.js.modules['$g']],
    function(detect, topNav, bean, bonzo, $g) {

        var urlParams = $g.getUrlVars();

        $g.onReady(function(){

            var moreClass = 'more-on-story zone-border ';

            switch(urlParams.moreMode) {
                case "inline":
                    moreClass += 'more-inline';
                    break;
                case "singleBlock":
                    moreClass += 'more-single-block';
                    break;
                case "multipleBlock":
                    moreClass += 'more-multiple-block';
                    break;
            }

            // swap out the related items if mode is base
            if (detect.getLayoutMode() == 'base') {
                var paragraphToInsertAfter = document.querySelectorAll('article p')[4];
                var related = document.getElementById('js-expandable-related');
                // todo: add different class based on URL

                bonzo(related).addClass(moreClass).insertAfter(paragraphToInsertAfter);
            }
        });

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

        mostPopular.fetchContent(endPoint, {
            isShaded: true,
            header: header
        });

        trailExpander.bindExpanders();
    }
);