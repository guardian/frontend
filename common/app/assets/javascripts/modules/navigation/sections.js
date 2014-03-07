define([
    'common/common',
    'bonzo',
    'common/utils/mediator',
    'common/utils/detect'
], function (
    common,
    bonzo,
    mediator,
    detect
) {

    function Sections(config) {
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

                mediator.addListener('window:resize', function(e) {
                    hasCrossedBreakpoint(function(layoutMode) {

                        bonzo(sectionsHeader).addClass(className);

                        if(layoutMode !== 'mobile') {
                            that.view.hideColumns(sectionsHeader, sectionsNav);

                            // Hide popup localnav if visible
                            common.$g('.nav-popup--localnav').addClass('is-off');
                        } else {
                            that.view.showColumns(sectionsHeader, sectionsNav);
                        }
                    });
                });

                if(detect.getBreakpoint() !== 'mobile') {
                    that.view.hideColumns(sectionsHeader, sectionsNav);
                }
            },

            showColumns : function(sectionsHeader, sectionsNav) {
                common.$g('.nav__item', sectionsHeader).removeClass('u-h');
            },

            hideColumns :  function(sectionsHeader, sectionsNav) {
                var firstTopPos,
                    visibleItems = [],
                    popupItems = common.$g('.nav__item', sectionsHeader).removeClass('u-h');

                common.$g('.nav__item', sectionsNav).each(function(e) {
                    firstTopPos = firstTopPos || bonzo(e).offset().top;
                    if(bonzo(e).offset().top === firstTopPos) {
                        visibleItems.push(e);
                    }
                });

                for(var i=0, l=visibleItems.length; i < l; i++) {
                    bonzo(popupItems[i]).addClass('u-h');
                }
            },

            // there is not a 'no javascript' version of this.
            upgradeLocalNav: function(context) {
                if (context.querySelector('.js-localnav--small')) {
                    common.$g('#preloads').addClass('has-localnav');
                    common.$g('.js-localnav--small').removeClass('is-hidden');
                }
            }
        };

        this.init = function (context) {
            this.view.bindings(context);
            this.view.upgradeLocalNav(context);
        };
     }

    return Sections;

});
