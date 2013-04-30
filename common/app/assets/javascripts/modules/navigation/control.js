define(['common', 'bean', 'bonzo'], function (common, bean, bonzo) {

    var Control = function () {

        var self = this,
            delay = 400,
            lastClickTime = 0;

        this.init = function(context) {
            Array.prototype.forEach.call(context.querySelectorAll('.control'), function(control){
                var toggler =  common.rateLimit(function() {
                    self.toggle(control, context);
                    common.mediator.emit('modules:control:change');
                });
                bean.add(control, 'click touchstart', function (e) {
                    toggler();
                    e.preventDefault();
                });
            });
        };

        this.closeGlobally = function() {
            Array.prototype.forEach.call(document.querySelectorAll('.swipepage'), function(context) {
                Array.prototype.forEach.call(context.querySelectorAll('.control'), function(control){
                    self.close(control, context);
                });
            });
        };
    };

    Control.prototype.toggle = function(control, context) {
        var self = this;
        Array.prototype.forEach.call(context.querySelectorAll('.control'), function(c){
            if (c === control) {
                self[bonzo(c).hasClass('is-active') ? 'close' : 'open'](c, context);
            }
            else {
                self.close(c, context);
            }
        });
    };

    Control.prototype.getTarget = function(control, context) {
        var targetClass = bonzo(control).data('control-for');
        if (targetClass) {
            return context.querySelector('.' + targetClass);
        }
    };

    Control.prototype.open = function(c, context) {
        var target = this.getTarget(c, context);
        if (target) {
            bonzo(c).addClass('is-active');
            bonzo(target).removeClass('is-off');
        }
    };
    
    Control.prototype.close = function(c, context) {
        var target = this.getTarget(c, context);
        if (target) {
            bonzo(c).removeClass('is-active');
            bonzo(target).addClass('is-off');
        }
    };

    return Control;
});
