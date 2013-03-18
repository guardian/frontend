define(['common', 'bonzo'], function (common, bonzo) {

    function Sections() {

        this.init = function () {

            var sectionsHeader = document.getElementById('sections-header'),
                $sectionsHeader = bonzo(sectionsHeader),
                className = 'is-off';

            common.mediator.on('modules:control:change:sections-control-header:true', function(args) {
                $sectionsHeader.removeClass(className);
                $sectionsHeader.focus();
            });

            common.mediator.on('modules:control:change', function(args) {

                var control = args[0],
                    state = args[1];

                if (state === false || control !== 'sections-control-header') {
                    $sectionsHeader.addClass(className);
                }

            });
        };
     }

    return Sections;

});
