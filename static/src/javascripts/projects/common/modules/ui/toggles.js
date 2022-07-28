import { mediator } from 'lib/mediator';

class Toggles {


    constructor(component = document.body) {
        if (component) {
            const controls = Array.from(
                component.querySelectorAll('[data-toggle]')
            );

            this.component = component;
            this.controls = controls;

            mediator.on('module:clickstream:click', clickSpec => {
                this.reset(clickSpec ? clickSpec.target : null);
            });
        }
    }

    init() {
        this.controls.forEach(this.prepareControl, this);
    }

    toggle(control) {
        this.controls.forEach(c => {
            if (c === control) {
                if (c.classList.contains('is-active')) {
                    this.close(c);
                } else {
                    this.open(c);
                }
            } else {
                this.close(c);
            }
        });
    }

    reset(omitEl) {
        const doNotReset = ['js-search-old', 'js-search-new'];

        this.controls
            .filter(
                control =>
                    !(
                        omitEl === control ||
                        doNotReset.includes(control.getAttribute('data-toggle'))
                    )
            )
            .forEach(this.close, this);
    }

    prepareControl(control) {
        const readyClass = 'js-toggle-ready';
        const nav = document.querySelector('.js-profile-nav');
        const isSignedIn = nav && nav.classList.contains('is-signed-in');

        if (!control.classList.contains(readyClass)) {
            const target = this.getTarget(control);

            if (
                target &&
                !(
                    !isSignedIn &&
                    control.getAttribute('data-toggle-signed-in') === 'true'
                )
            ) {
                control.classList.add(readyClass);
                control.addEventListener(
                    'click',
                    (e) => {
                        e.preventDefault();
                        this.toggle(control);
                    }
                );
            }
        }
    }

    getTarget(control) {
        const targetClass = control.getAttribute('data-toggle');

        if (targetClass) {
            if (this.component) {
                return this.component.querySelector(`.${targetClass}`);
            }
        }
    }

    open(control) {
        const target = this.getTarget(control);

        control.classList.add('is-active');

        if (target) {
            target.classList.remove('is-off');
        }
    }

    close(control) {
        const target = this.getTarget(control);

        control.classList.remove('is-active');

        if (target) {
            target.classList.add('is-off');
        }
    }
}

export { Toggles };
