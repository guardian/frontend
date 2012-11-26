define(['common', 'bean', 'bonzo'], function (common, Bean, bonzo) {
    var Navigation;

    Navigation = function (opts) {
        var toggles, view, model;
       
        // View
        
        view = {

            toggle: function (state, position, elm) {
                var item, altItem, altButton;

                item = bonzo(document.getElementById(((state === "sections") ? "sections-" + position : "topstories-" + position)));
                altItem = bonzo(document.getElementById(((state === "sections") ?  "topstories-" + position : "sections-" + position)));
                altButton = bonzo(document.getElementById(((state === "sections") ?  "topstories-control-" + position : "sections-control-" + position)));

                if (altItem.hasClass('on')) { // the "other" panel is visible, so hide it then show current
                    altItem.toggleClass('on initially-off');
                    altButton.toggleClass('is-active');
                }

                item.toggleClass('on initially-off');
                elm = bonzo(elm).toggleClass('is-active');

                return (state);
            },

            // we don't show the bottom section icon unless JS is enabled,
            // since it doesn't do anything at the footer
            // so we show it here since JS is on
            showHiddenSectionControls: function () {
                var navItems = common.$g('.sections-control'), i, l, elm;
                 for (i = 0, l = navItems.length; i < l; i++) {
                    elm = navItems[i];
                    bonzo(elm).removeClass('initially-off');
                }
            },

            init: function () {

                view.showHiddenSectionControls();
                var lastClickTime = 0;

                // can't seem to get bean to bind on arrays of elements properly,
                // and doing it inside loops does weird closure-related things. ugh.

                Bean.add(document.getElementById('sections-control-header'), 'click touchstart', function (e) {
                    var elm = this;
                    var current = new Date().getTime();
                    var delta = current - lastClickTime;
                    if (delta > 400) {
                        view.toggle('sections', 'header', elm);
                    }
                    e.preventDefault();
                    lastClickTime = current;
                });
                
                Bean.add(document.getElementById('topstories-control-header'), 'click touchstart', function (e) {
                    var elm = this;
                    var current = new Date().getTime();
                    var delta = current - lastClickTime;
                    if (delta > 400) {
                        view.toggle('topstories', 'header', elm);
                    }
                    e.preventDefault();
                    lastClickTime = current;
                });
            }

        };

        // Model

        model = {
        };
        
        this.init = function () {
            view.init();
        };
    };


    return Navigation;
   
});

