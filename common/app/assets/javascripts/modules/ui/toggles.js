define([
    'common',
    'bean',
    'bonzo'
], function (
    common,
    bean,
    bonzo
) {

    var Toggles = function () {

        var self = this,
            controls,
            readyClass = 'js-toggle-ready';

        this.init = function(context) {
            controls = context.querySelectorAll('[data-toggle]');
            Array.prototype.forEach.call(controls, function(control) {
                if (!bonzo(control).hasClass(readyClass)) {
                    var target = self.getTarget(control, context);
                    if (target) {
                        control.toggleTarget = target;
                        bonzo(control).addClass(readyClass);
                        bean.add(control, 'click touchstart', function (e) {
                            e.preventDefault();
                            self.toggle(control, controls);
                        });
                    }
                }
            });
        };

        this.reset = function() {
            Array.prototype.forEach.call(controls, self.close);
        };
    };

    Toggles.prototype.toggle = function(control, controls) {
        var self = this;
        Array.prototype.forEach.call(controls, function(c){
            if (c === control) {
                self[bonzo(c).hasClass('is-active') ? 'close' : 'open'](c);
            }
            else {
                self.close(c);
            }
        });
    };

    Toggles.prototype.getTarget = function(control, context) {
        var targetClass = bonzo(control).data('toggle');
        if (targetClass) {
            return context.querySelector('.' + targetClass);
        }
    };

    Toggles.prototype.open = function(c) {
        bonzo(c).addClass('is-active');
        bonzo(c.toggleTarget).removeClass('is-off');
    };

    Toggles.prototype.close = function(c) {
        bonzo(c).removeClass('is-active');
        bonzo(c.toggleTarget).addClass('is-off');
    };

    return Toggles;
});
