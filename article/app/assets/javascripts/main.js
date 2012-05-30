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
        trailExpander.bindExpanders();
    }
);
