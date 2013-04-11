define(['common', 'bean', 'bonzo'], function (common, bean, bonzo) {

    var Controls = function (opts) {

        var state = false,
            id = opts.id,
            delay = opts.delay || 400,
            lastClickTime = 0,
            activeClass = 'is-active',
            dom;

        var view = {

            bindEventToButton: function() {
                if(dom[0] === undefined) { return; } //This is for pages with top-stories
                bean.add(dom[0], 'click touchstart', function (e) {
                    var current = new Date().getTime();
                    var delta = current - lastClickTime;
                    if (delta >= delay) {
                        view.renderState();
                        lastClickTime = current;
                    }
                    e.preventDefault();
                });
            },

            isActive: function () {
                return dom.hasClass('is-active');
            },

            deactivate: function () {
                dom.removeClass(activeClass);
            },

            show: function () {
                dom.removeClass('is-off');
            },

            activate: function () {
                dom.addClass(activeClass);
            },

            renderState: function() {

                var isActive = view.isActive();

                if (isActive) {
                    view.deactivate();
                } else {
                    view.activate();
                }

                common.mediator.emit('modules:control:change', [id, !isActive]);
                common.mediator.emit('modules:control:change:' + id + ':' + !isActive);
            }
        };

        // deactivate this button if another button has been activated
        common.mediator.on('modules:control:change', function(args) {

            var control = args[0],
                state = args[1];

            if (id !== control) {
                view.deactivate();
            }

        });

        this.show = function() {
            view.show();
        };

        this.init = function() {
            dom = common.$g('#' + id);
            view.bindEventToButton();
        };

    };

    return Controls;

});
