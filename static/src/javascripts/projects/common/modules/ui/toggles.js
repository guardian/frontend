import bean from 'bean';
import mediator from 'lib/mediator';
import contains from 'lodash/collections/contains';

var Toggles = function(parent) {

    var self = this,
        controls,
        doNotReset = ['popup--search'],
        readyClass = 'js-toggle-ready',
        isSignedIn = (function() {
            var nav = document.querySelector('.js-profile-nav');
            return nav && nav.classList.contains('is-signed-in');
        }()),
        component = parent || document.body;

    this.init = function() {
        controls = Array.prototype.slice.call(component.querySelectorAll('[data-toggle]'));

        controls.forEach(function(control) {
            if (!control.classList.contains(readyClass)) {
                var target = self.getTarget(component, control);

                if (target && !(!isSignedIn && control.getAttribute('data-toggle-signed-in') === 'true')) {
                    control.toggleTarget = target;
                    control.classList.add(readyClass);
                    bean.add(control, 'click', function(e) {
                        e.preventDefault();
                        self.toggle(control, controls);
                    });
                }
            }
        });
    };

    this.reset = function(omitEl) {
        controls.filter(function(control) {
            return !(omitEl === control || contains(doNotReset, control.getAttribute('data-toggle')));
        }).map(self.close);
    };

    mediator.on('module:clickstream:click', function(clickSpec) {
        self.reset(clickSpec ? clickSpec.target : null);
    });
};

Toggles.prototype.toggle = function(control, controls) {
    var self = this;

    controls.forEach(function(c) {
        if (c === control) {
            self[c.classList.contains('is-active') ? 'close' : 'open'](c);
        } else {
            self.close(c);
        }
    });
};

Toggles.prototype.getTarget = function(parent, control) {
    var targetClass = control.getAttribute('data-toggle');
    if (targetClass) {
        return parent.querySelector('.' + targetClass);
    }
};

Toggles.prototype.open = function(c) {
    c.classList.add('is-active');
    if (c.toggleTarget) {
        c.toggleTarget.classList.remove('is-off');
    }
};

Toggles.prototype.close = function(c) {
    c.classList.remove('is-active');
    if (c.toggleTarget) {
        c.toggleTarget.classList.add('is-off');
    }
};

export default Toggles;
