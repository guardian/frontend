define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/_',
    'common/utils/mediator'
], function (
    bean,
    bonzo,
    $,
    _,
    mediator
) {

    var Toggles = function (parent) {

        var self = this,
            controls,
            doNotReset = ['popup--search'],
            readyClass = 'js-toggle-ready',
            isSignedIn = $('.js-profile-nav').hasClass('is-signed-in'),
            component  = parent || document.body;

        this.init = function () {
            controls = Array.prototype.slice.call(component.querySelectorAll('[data-toggle]'));

            controls.forEach(function (control) {
                if (!bonzo(control).hasClass(readyClass)) {
                    var target = self.getTarget(control);

                    if (target && !(!isSignedIn && control.getAttribute('data-toggle-signed-in') === 'true')) {
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
                return !(omitEl === control || _.contains(doNotReset, $(control).attr('data-toggle')));
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
