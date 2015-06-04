define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/mediator'
], function (
    bean,
    bonzo,
    $,
    mediator
) {

    var Toggles = function () {

        var self = this,
            controls,
            readyClass = 'js-toggle-ready';

        this.init = function () {
            controls = Array.prototype.slice.call(document.body.querySelectorAll('[data-toggle]'));

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

        this.reset = function (omitEl) {
            controls.filter(function (control) {
                return !$.isDescendantOrSelf(omitEl, control) && !$.isDescendantOrSelf(omitEl, control.toggleTarget);
            }).map(self.close);
        };

        mediator.on('module:clickstream:click', function (clickSpec) {
            self.reset(clickSpec ? clickSpec.target : null);
        });
    };

    Toggles.prototype.toggle = function (control, controls) {
        var self = this;

        controls.forEach(function (c) {
            if (c === control) {
                self[bonzo(c).hasClass('is-active') ? 'close' : 'open'](c);
            } else {
                self.close(c);
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
