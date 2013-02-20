define([
    "modules/accordion"
], function(
    Accordion
    ) {

    var modules = {
        initAccordion: function () {
            if(document.querySelector('.accordion')) {
                console.log('init accordion');
                var a = new Accordion();
            }
        }
    };

    var init = function(req, config) {
        console.log('story');
        modules.initAccordion();
    };

    return {
        init: init
    };
});
