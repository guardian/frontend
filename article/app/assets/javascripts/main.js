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
require([guardian.js.modules.mostPopular, 
    guardian.js.modules.trailExpander,
    guardian.js.modules["$g"],
    "bonzo",
    "bean",
    guardian.js.modules.detect],
    function(mostPopular, trailExpander, $g, bonzo, bean, detect){

        trailExpander.init();

        var urlParams = $g.getUrlVars();

        // begin more-on-story tests
        $g.onReady(function(){

            var moreClass = 'more-on-story zone-border ';
            var hasPref = false;

            // todo: remove show-n from div. HOW. regex i guess

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
            }

            // save their pref
            if(urlParams.moreMode) {
                localStorage.setItem("moreMode", moreClass);
            } else if (localStorage.getItem("moreMode")) {
                hasPref = true;
                moreClass += ' ' + localStorage.getItem("moreMode");
            }

            // swap out the related items if mode is base
            if ( (urlParams.moreMode || hasPref) && detect.getLayoutMode() != 'extended') {
                var paragraphToInsertAfter = document.querySelectorAll('article p')[4];
                var related = document.getElementById('js-expandable-related');

                // this is somewhat ugly. we need to remove the show-4 or whatever
                // class from most popular as it's a variable so we don't know what it is.
                // we can't just add more classes (.show-3 .show-5 etc) as specificity fails.
                var regex = /show-\d+/g;
                var classnames = related.className;
                related.className = classnames.replace(regex, '');
                // todo: add different class based on URL

                bonzo(related).addClass(moreClass).insertAfter(paragraphToInsertAfter);
                
            }
        });

        var endPoint = 'http://simple-navigation.appspot.com/most-popular/section/' + guardian.page.section;
        var header = 'Popular right now';
        if (document.referrer && document.referrer.toLowerCase().indexOf('facebook.com') > -1) {
            endPoint = 'http://simple-navigation.appspot.com/most-popular/facebook';
            header = 'Popular right now on Facebook';
        }

        mostPopular.fetchContent(endPoint, {
            isShaded: true,
            header: header,
            limit: 5
        });

        // initialise event listener for trail expanders
        guardian.js.ee.emit('addExpander', $g.qs('#js-expandable-related'));
    }
);