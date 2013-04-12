define(['common', 'bean', 'bonzo'], function (common, bean, bonzo) {

    var NavTabs = function () {

        var delay = 400,
            lastClickTime = 0,
            self = this;

        this.view = {
            toggle: function(controls, control, context) {
                Array.prototype.forEach.call(controls, function(c){
                    if (c === control) {
                        self.view[bonzo(c).hasClass('is-active') ? 'close' : 'open'](c, context);
                    }
                    else {
                        self.view.close(c, context);
                    }
                });
            },

            open: function(c, context) {
                bonzo(c).addClass('is-active');
                bonzo(self.model.getTarget(c, context)).removeClass('is-off');
            },
            
            close: function(c, context) {
                bonzo(c).removeClass('is-active');
                bonzo(self.model.getTarget(c, context)).addClass('is-off');
            }
        };

        this.model = {
            getTarget: function(control, context) {
                var target = bonzo(control).data('control-for');
                if (target) {
                    return context.querySelector('.' + target);
                }
            }
        };

        this.init = function(context) {
            var controls = context.querySelectorAll('.control');
            Array.prototype.forEach.call(controls, function(control){
                var target = self.model.getTarget(control, context);
                if (target) {
                    bean.add(control, 'click touchstart', function (e) {
                        var current = new Date().getTime();
                        var delta = current - lastClickTime;
                        if (delta >= delay) {
                            lastClickTime = current;
                            self.view.toggle(controls, control, context);
                        }
                        e.preventDefault();
                    });
                }
            });
        };
    };

    return NavTabs;

});
