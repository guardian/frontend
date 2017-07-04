// @flow
import mediator from 'lib/mediator';
import fastdom from 'fastdom';

/**
 * @todo: check if browser natively supports "position: sticky"
 */
class Sticky {
    element: HTMLElement;
    opts: Object;
    offsetFromParent: number;
    lastMessage: string;

    constructor(element: HTMLElement, options: Object = {}): void {
        this.element = element;

        this.opts = Object.assign(
            {},
            {
                top: 0,
                containInParent: true,
                emitMessage: false,
            },
            options
        );
    }

    init(): void {
        const parentElement = this.element.parentElement;

        if (!parentElement) {
            return;
        }

        fastdom.read(() => {
            this.offsetFromParent =
                this.element.getBoundingClientRect().top -
                parentElement.getBoundingClientRect().top;
        }, this);
        mediator.on('window:throttledScroll', this.updatePosition.bind(this));
        // kick off an initial position update
        fastdom.read(this.updatePosition, this);
    }

    updatePosition(): void {
        const parentElement = this.element.parentElement;

        if (!parentElement) {
            return;
        }

        const elementRect = this.element.getBoundingClientRect();
        const parentRect = parentElement.getBoundingClientRect();
        const elementHeight = elementRect.height;
        let css;
        let message;
        let stick;

        // have we scrolled past the element
        if (parentRect.top + this.offsetFromParent > 0) {
            stick = false;
            css = {
                top: '',
            };
            message = 'unfixed';
        } else {
            stick = true;
            const top =
                this.opts.containInParent &&
                parentRect.bottom <= elementRect.height
                    ? Math.floor(
                          parentRect.bottom - elementHeight - this.opts.top
                      )
                    : this.opts.top;
            css = {
                top: `${top}px`,
            };
            message = 'fixed';
        }

        if (this.opts.emitMessage && message && message !== this.lastMessage) {
            this.emitMessage(message);
            this.lastMessage = message;
        }

        if (css) {
            fastdom.write(() => {
                if (stick) {
                    this.element.classList.add('is-sticky');
                } else {
                    this.element.classList.remove('is-sticky');
                }
                Object.assign(this.element.style, css);
            }, this);
        }
    }

    emitMessage(message: string): void {
        mediator.emit(`modules:${this.element.id}:${message}`);
    }
}

export { Sticky };
