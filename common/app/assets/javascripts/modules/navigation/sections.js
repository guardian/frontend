define([
    'common/utils/$',
    'bonzo',
    'common/utils/mediator',
    'common/utils/detect'
], function (
    $,
    bonzo,
    mediator,
    detect
) {

    function Sections() {
        var className = 'is-off',
            that = this,
            hasCrossedBreakpoint = detect.hasCrossedBreakpoint(),
            contexts = {};

        this.view = {
            bindings : function(context) {
                var id = context.id;

                if(contexts[id]){
                    return;
                }
                contexts[id] = true;

                var sectionsHeader = context.querySelector('.nav-popup--sections'),
                    sectionsNav    = context.querySelector('.nav--global');

                if (!sectionsHeader || !sectionsNav) {
                    return;
                }

                mediator.addListener('window:resize', function() {
                    hasCrossedBreakpoint(function(layoutMode) {

                        bonzo(sectionsHeader).addClass(className);

                        if(layoutMode !== 'mobile') {
                            that.view.hideColumns(sectionsHeader, sectionsNav);

                            // Hide popup localnav if visible
                            $('.nav-popup--localnav').addClass('is-off');
                        } else {
                            that.view.showColumns(sectionsHeader, sectionsNav);
                        }
                    });
                });

                if(detect.getBreakpoint() !== 'mobile') {
                    that.view.hideColumns(sectionsHeader, sectionsNav);
                }
            },

            showColumns : function(sectionsHeader) {
                $('.nav__item', sectionsHeader).removeClass('u-h');
            },

            hideColumns :  function(sectionsHeader, sectionsNav) {
                var firstTopPos,
                    visibleItems = [],
                    popupItems = $('.nav__item', sectionsHeader).removeClass('u-h');

                $('.nav__item', sectionsNav).each(function(e) {
                    firstTopPos = firstTopPos || bonzo(e).offset().top;
                    if(bonzo(e).offset().top === firstTopPos) {
                        visibleItems.push(e);
                    }
                });

                for(var i=0, l=visibleItems.length; i < l; i++) {
                    bonzo(popupItems[i]).addClass('u-h');
                }
            }
        };

        this.init = function (context) {
            this.view.bindings(context);
        };
     }

    return Sections;

});
