//requirejs.config({
    //paths: guardian.js.modules
//});

//High priority modules
require([guardian.js.modules.detect, "bean", "bonzo"],
    function(detect, bean, bonzo) {

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
