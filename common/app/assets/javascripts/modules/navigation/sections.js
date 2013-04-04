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

                bean.on(window, 'resize', common.debounce(function(e){
                    var layoutMode = detect.getLayoutMode();

                    bonzo(sectionsHeader).addClass(className);

                    if(layoutMode != 'mobile') {
                        that.view.hideColumns();
                    } else {
                        that.view.showColumns();
                    }
                }, 200));
            },

            showColumns : function() {
                popupItems = common.$g('.nav__item', sectionsHeader).removeClass('h');
                common.$g('.nav', sectionsHeader).removeClass('nav--stacked').addClass('nav--columns');
            },

            hideColumns :  function() {
                common.$g('.nav', sectionsHeader).removeClass('nav--columns').addClass('nav--stacked');

                var visibleItems = [];
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

        this.init = function () {
            var layoutMode = detect.getLayoutMode();
            this.view.bindings();

            if(layoutMode != 'mobile') {
                this.view.hideColumns();
            }
        };
     }

    return Sections;

});
