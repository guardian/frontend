define(['common', 'bean', 'bonzo'], function (common, Bean, bonzo) {
    var Navigation;

    Navigation = function (opts) {
        var toggles, view, model;
       
        // View
        
        view = {

            toggle: function (state, position, elm) {
                var item, altItem;

                item = bonzo(document.getElementById(((state === "sections") ? "sections-" + position : "topstories-" + position)));
                altItem = bonzo(document.getElementById(((state === "sections") ?  "topstories-" + position : "sections-" + position)));

                if (altItem.hasClass('on')) { // the "other" panel is visible, so hide it then show current
                    altItem.toggleClass('on initially-off');
                }

                if (item.hasClass('initially-off')) {
                    item.toggleClass('on initially-off');
                } else if (item.hasClass('on')) {
                    item.toggleClass('on initially-off');
                }

                return (state);
            },

            // this menu is on by default for non-JS users, so we hide it once JS is loaded
            hideBottomMenu: function () {
                var bottomMenu = document.getElementById('sections-footer');
                bonzo(bottomMenu).addClass('initially-off');
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

                view.hideBottomMenu();

                view.showHiddenSectionControls();

                // can't seem to get bean to bind on arrays of elements properly,
                // and doing it inside loops does weird closure-related things. ugh.

                Bean.add(document.getElementById('sections-control-header'), 'click touchstart', function (e) {
                    var elm = this;
                    view.toggle('sections', 'header', elm);
                    e.preventDefault();
                });

                Bean.add(document.getElementById('sections-control-footer'), 'click touchstart', function (e) {
                    var elm = this;
                    view.toggle('sections', 'footer', elm);
                    e.preventDefault();
                });
                
                Bean.add(document.getElementById('topstories-control-header'), 'click touchstart', function (e) {
                    var elm = this;
                    view.toggle('topstories', 'header', elm);
                    e.preventDefault();
                });

                Bean.add(document.getElementById('topstories-control-footer'), 'click touchstart', function (e) {
                    var elm = this;
                    view.toggle('topstories', 'footer', elm);
                    e.preventDefault();
                });

            }
                    
        };

        // Model

        model = {
        };
        
        this.initialise = function () {
            view.init();
        };
    };


    return Navigation;
   
});

