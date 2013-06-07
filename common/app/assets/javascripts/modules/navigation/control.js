define(['common', 'bean', 'bonzo'], function (common, bean, bonzo) {

    var Control = function () {

        var self = this,
            controls;

        this.init = function(context) {
            controls = context.querySelectorAll('.control');
            Array.prototype.forEach.call(controls, function(control) {
                var popup = self.getPopup(control, context);
                if(popup){
                    control.popup = popup;
                    bean.add(control, 'click touchstart', function (e) {
                        e.preventDefault();
                        self.toggle(control, controls);
                        common.mediator.emit('modules:control:change');
                    });
                }
            });

            this.reset();
        };

        this.reset = function() {
            Array.prototype.forEach.call(controls, self.close);
        };
    };

    Control.prototype.toggle = function(control, controls) {
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

    Control.prototype.getPopup = function(control, context) {
        var popupClass = bonzo(control).data('control-for');
        if (popupClass) {
            return context.querySelector('.' + popupClass);
        }
    };

    Control.prototype.open = function(c) {
        bonzo(c).addClass('is-active');
        bonzo(c.popup).removeClass('is-off');
    };
    
    Control.prototype.close = function(c) {
        bonzo(c).removeClass('is-active');
        bonzo(c.popup).addClass('is-off');
    };

    return Control;
});
