define([
    "modules/accordion"
], function(
    Accordion
    ) {

    var modules = {
        initAccordion: function () {
            if(document.querySelector('.accordion')) {
                var a = new Accordion();
            }
        }
    };

    var init = function(req, config) {
        modules.initAccordion();
    };

    return {
        init: init
    };
});
