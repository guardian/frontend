define(['common', 'bean', 'bonzo'], function (common, bean, bonzo) {

    var Control = function () {

        var self = this,
            contexts = {};

        this.init = function(context) {
            var id = context.id,
                controls;

            if(id && !contexts[id]){
                controls = context.querySelectorAll('.control');
                contexts[id] = controls;
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
            }

            for (var c in contexts) {
                if (c !== id) {
                    Array.prototype.forEach.call(contexts[c], self.close);
                }
            }
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
