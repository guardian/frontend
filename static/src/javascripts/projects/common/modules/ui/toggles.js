define([
    'bean',
    'bonzo',
    'common/utils/mediator'
], function (
    bean,
    bonzo,
    mediator
) {

    var Toggles = function () {

        var self = this,
            controls,
            readyClass = 'js-toggle-ready';

        this.init = function () {
            controls = Array.prototype.slice.call(document.body.querySelectorAll('[data-toggle]'), 0);

            controls.forEach(function (control) {
                if (!bonzo(control).hasClass(readyClass)) {
                    var target = self.getTarget(control);
                    if (target) {
                        control.toggleTarget = target;
                        bonzo(control).addClass(readyClass);
                        bean.add(control, 'click', function (e) {
                            e.preventDefault();
                            self.toggle(control, controls);
                        });
                    }
                }
            });
        };

        this.reset = function (clickSpec) {
            controls.filter(function (c) {
                return !clickSpec || c !== clickSpec.target;
            }).map(self.close);
        };

        mediator.on('module:clickstream:interaction', this.reset);
        mediator.on('module:clickstream:click', this.reset);
        mediator.on('module:clickstream:null', this.reset);
    };

    Toggles.prototype.toggle = function (control, controls) {
        var self = this;

        controls.forEach(function (c) {
            if (c === control) {
                self[bonzo(c).hasClass('is-active') ? 'close' : 'open'](c);
            }
        });
    };

    Toggles.prototype.getTarget = function (control) {
        var targetClass = bonzo(control).data('toggle');
        if (targetClass) {
            return document.body.querySelector('.' + targetClass);
        }
    };

    Toggles.prototype.open = function (c) {
        bonzo(c).addClass('is-active');
        bonzo(c.toggleTarget).removeClass('is-off');
    };

    Toggles.prototype.close = function (c) {
        bonzo(c).removeClass('is-active');
        bonzo(c.toggleTarget).addClass('is-off');
    };

    return Toggles;
});
