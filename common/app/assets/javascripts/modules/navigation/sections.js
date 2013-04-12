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

        var sectionsHeader = document.getElementById('sections-header'),
            sectionsNav = document.querySelector('.nav--global'),
            $sectionsHeader = bonzo(sectionsHeader),
            className = 'is-off',
            that = this;

        this.view = {
            bindings : function() {
                var hasCrossedBreakpoint = detect.hasCrossedBreakpoint();

                bean.on(window, 'resize', common.debounce(function(e){
                    hasCrossedBreakpoint(function(layoutMode) {

                        bonzo(sectionsHeader).addClass(className);
                        common.mediator.emit('modules:control:change', ['search-control-header', true]);

                        if(layoutMode !== 'mobile') {
                            that.view.hideColumns();
                        } else {
                            that.view.showColumns();
                        }
                    });
                }, 200));
            },

            showColumns : function() {
                common.$g('.nav__item', sectionsHeader).removeClass('h');
                common.$g('.nav', sectionsHeader).removeClass('nav--stacked').addClass('nav--columns');
            },

            hideColumns :  function() {
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

            if(detect.getLayoutMode() !== 'mobile') {
                this.view.hideColumns();
            }
        };
     }

    return Sections;

});
