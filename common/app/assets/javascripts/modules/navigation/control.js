define(['common', 'bean', 'bonzo'], function (common, bean, bonzo) {

    var Control = function () {

        var self = this,
            delay = 400,
            lastClickTime = 0;

        this.init = function(context) {
            var controls = context.querySelectorAll('.control');

            Array.prototype.forEach.call(controls, function(control){
                var target = self.getTarget(control, context);
                if (target) {
                    bean.add(control, 'click touchstart', function (e) {
                        var current = new Date().getTime();
                        var delta = current - lastClickTime;
                        if (delta >= delay) {
                            lastClickTime = current;
                            self.toggle(controls, control, context);
                            common.mediator.emit('modules:control:change');
                        }
                        e.preventDefault();
                    });
                }
            });
        };
    };

    Control.prototype.toggle = function(controls, control, context) {
        var self = this;
        Array.prototype.forEach.call(controls, function(c){
            if (c === control) {
                self[bonzo(c).hasClass('is-active') ? 'close' : 'open'](c, context);
            }
            else {
                self.close(c, context);
            }
        });
    };

    Control.prototype.getTarget = function(control, context) {
        var target = bonzo(control).data('control-for');
        if (target) {
            return context.querySelector('.' + target);
        }
    };

    Control.prototype.open = function(c, context) {
        bonzo(c).addClass('is-active');
        bonzo(this.getTarget(c, context)).removeClass('is-off');
    };
    
    Control.prototype.close = function(c, context) {
        bonzo(c).removeClass('is-active');
        bonzo(this.getTarget(c, context)).addClass('is-off');
    };

    return Control;
});
