define([
    'common',
    'bonzo',
    'bean',
    'modules/detect'
], function (
    common,
    bonzo,
    bean,
    detect
) {

    function Sections() {

        var className = 'is-off',
            that = this,
            hasCrossedBreakpoint = detect.hasCrossedBreakpoint();

        this.view = {
            bindings : function(context) {

                var sectionsHeader = context.querySelector('.nav-popup-sections'),
                    sectionsNav    = context.querySelector('.nav--global'),
                    $sectionsHeader = bonzo(sectionsHeader);

                bean.on(window, 'resize', common.debounce(function(e){
                    hasCrossedBreakpoint(function(layoutMode) {

                        bonzo(sectionsHeader).addClass(className);

                        if(layoutMode !== 'mobile') {
                            that.view.hideColumns(sectionsHeader, sectionsNav);
                        } else {
                            that.view.showColumns(sectionsHeader, sectionsNav);
                        }
                    });
                }, 200));

                if(detect.getLayoutMode() !== 'mobile') {
                    that.view.hideColumns(sectionsHeader, sectionsNav);
                }
            },

            showColumns : function(sectionsHeader, sectionsNav) {
                common.$g('.nav__item', sectionsHeader).removeClass('h');
                common.$g('.nav', sectionsHeader).removeClass('nav--stacked').addClass('nav--columns');
            },

            hideColumns :  function(sectionsHeader, sectionsNav) {
                common.$g('.nav', sectionsHeader).removeClass('nav--columns').addClass('nav--stacked');

                var visibleItems = [],
                popupItems = common.$g('.nav__item', sectionsHeader).removeClass('h');

                common.$g('.nav__item', sectionsNav).each(function(e) {
                    if(bonzo(e).offset().top < 160) {
                        visibleItems.push(e);
                    }
                });

                for(var i=0, l=visibleItems.length; i < l; i++) {
                    bonzo(popupItems[i]).addClass('h');
                }
            }
        };

        this.init = function (context) {
            this.view.bindings(context);
        };
     }

    return Sections;

});
