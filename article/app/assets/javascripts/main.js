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

        // hack-tastic

        function readCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        }


        // begin more-on-story tests        
        var mode = readCookie("moreMode")

        // begin tests for in-article related items
        // swap out the related items if layout mode is base/extended
        // and user mode pref is between 1-3 (used for in-article related info)
        if (mode && mode < 4 && detect.getLayoutMode() != 'extended') {

            var moreClass = 'more-on-story zone-border ';

            mode = parseInt(mode); // localStorage makes everything a string

            switch(mode) {
                case 1:
                    moreClass += 'more-inline';
                    var listClass = 'show-3';
                    break;
                case 2:
                    moreClass += 'more-single-block';
                    var listClass = 'show-1';
                    break;
                case 3:
                    moreClass += 'more-multiple-block';
                    var listClass = 'show-1';
                    break;
            }

            $g.onReady(function(){
                var paragraphToInsertAfter = document.querySelectorAll('article p')[4];
                var related = document.getElementById('js-expandable-related');

                // this is somewhat ugly. we need to remove the show-4 or whatever
                // class from most popular as it's a variable so we don't know what it is.
                // we can't just add more classes (.show-3 .show-5 etc) as specificity fails.
                var regex = /show-\d+/g;
                var classnames = related.className;
                related.className = classnames.replace(regex, '');

                // add show-n to the list of trails
                var ul = $g.qs('ul', related);
                bonzo(ul).addClass(listClass);

                // move the item to the right place
                bonzo(related).addClass(moreClass).insertAfter(paragraphToInsertAfter);


                if (mode == 3) {
                    // todo: sometimes it doesn't have an expander, bah
                    // check and add one
                    guardian.js.ee.emit('addExpander', related);
                }
            });
        }


        function fetchMostPopular(limit) {

            var endPoint = 'http://simple-navigation.appspot.com/most-popular/section/' + guardian.page.section;
            //var header =  guardian.page.section + ' most read';
            var header = null;
            if (document.referrer && document.referrer.toLowerCase().indexOf('facebook.com') > -1) {
                endPoint = 'http://simple-navigation.appspot.com/most-popular/facebook';
                header = 'Most read on Facebook';
            }

            var placeholder = document.getElementById('tier3-3');

            trailblockGenerator.fetchContent(endPoint, {
                isShaded: true,
                header: header,
                limit: limit,
                elm: placeholder
            });
        
        }
        
        // todo: maybe add option to trailblockGenerator not to expand?
        function fetchRelatedByTags(limit, allowExpanding) {

            // todo: limit to 10 tags max
            var tags = '?tag=' + guardian.page.tagIds.replace(/,/g, '&tag=') + '&ignore=' + guardian.page.pageId;
            var moreOnTagsUrl = 'http://simple-navigation.appspot.com/munge-latest.json';
            var tagUrl = moreOnTagsUrl + tags;

            var placeholder = document.getElementById('tier3-2');

            trailblockGenerator.fetchContent(tagUrl, {
                isShaded: false,
                limit: limit,
                mode: 'nestedSingle',
                elm: placeholder,
                header: 'Related content by tags',
                allowExpanding: allowExpanding,
                showSubHeadings: true
            });
        }

        // we're entering tests 4-6: related content tests

        var relatedContent = $g.qs('#js-expandable-related');

        if (mode && mode > 3) {

            mode = parseInt(mode); 

            switch (mode) {
                case 4:
                    // turn related items into an expander
                    guardian.js.ee.emit('addExpander', relatedContent);
                    fetchMostPopular(5);
                    break;
                case 5:
                    // remove related items
                    bonzo(relatedContent).remove();
                    // show related items by tags
                    fetchRelatedByTags(5, true);
                    // then get most popular
                    fetchMostPopular(5);
                    break;
                case 6:
                    // turn related items into an expander
                    guardian.js.ee.emit('addExpander', relatedContent);
                    // show related items by tags
                    fetchRelatedByTags(3, false);
                    // then get most popular
                    fetchMostPopular(5);
                    break;
            }
        }
        
    }
);