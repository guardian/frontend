//requirejs.config({
    //paths: guardian.js.modules
//});

//High priority modules
require([guardian.js.modules.detect, 
    guardian.js.modules.images, 
    guardian.js.modules.fetchDiscussion, 
    guardian.js.modules.discussionBinder,
    "bean",
    "bonzo"],
    function(detect, images, discussion, discussionBinder, bean, _bonzo_) {

        var gu_debug = {
            screenHeight: screen.height,
            screenWidth: screen.width,
            windowWidth: window.innerWidth || document.body.offsetWidth || 0,
            windowHeight: window.innerHeight || document.body.offsetHeight || 0,
            layout: detect.getLayoutMode(),
            bandwidth: detect.getConnectionSpeed(),
            battery: detect.getBatteryLevel(),
            pixelratio: detect.getPixelRatio(),
            retina: (detect.getPixelRatio() === 2) ? 'true' : 'false'
        };

        for (var key in gu_debug) {
            document.getElementById(key).innerText = gu_debug[key];
        }

        // find and upgrade images (if supported)
        images.upgrade();

        // fetch comments html
        discussion.fetchCommentsForContent(
            guardian.page.shortUrl, 
            guardian.config.discussion.numCommentsPerPage, 
            1, // pageOffset
            discussionBinder.renderDiscussion // callback to send HTML output to
        );

        // toggle the nav submenu state
        var sectionExpander = document.getElementById('js-show-sections');
        var submenu = document.getElementById('js-section-subnav');
        bean.add(sectionExpander, 'click', function(){
            bonzo(submenu).toggleClass('initially-off');
        });

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
        trailExpander.bindExpanders();
    }
);
