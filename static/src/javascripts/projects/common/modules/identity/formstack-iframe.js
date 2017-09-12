// @flow

import mediator from 'lib/mediator';

class FormstackIframe {
    el: HTMLIFrameElement;
    config: Object;

    constructor(el: HTMLIFrameElement, config: Object): void {
        this.el = el;
        this.config = config;
    }

    init(): void {
        // Setup postMessage listener for events from "modules/identity/formstack"
        window.addEventListener('message', (event: MessageEvent): void => {
            if (event.origin === this.config.page.idUrl) {
                this.onMessage(event);
            }
        });

        mediator.on('window:throttledResize', (): void => {
            this.refreshHeight();
        });

        // Listen for load of form confirmation or error page,
        // which has no form, so won't instantiate the Formstack module
        this.el.addEventListener('load', (): void => {
            this.show();
            this.refreshHeight();
        });
    }

    onMessage(event: MessageEvent): void {
        switch (event.data) {
            case 'ready':
                this.show();
                this.refreshHeight();
                break;

            case 'unload':
                this.refreshHeight(true);
                break;

            case 'refreshHeight':
                this.refreshHeight();
                break;

            default: // do nothing
        }
    }

    refreshHeight(reset?: boolean): void {
        if (reset) {
            // If a height is set on the iframe, the following calculation
            // will be at least that height, optionally reset first
            this.el.style.height = '0';
        }

        const iframe = this.el.contentWindow.document;

        if (!iframe) {
            return;
        }

        const body = iframe.body;
        const html = iframe.documentElement;

        if (body && html) {
            const height = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            );

            this.el.style.height = `${height}px`;
        }
    }

    show() {
        this.el.classList.remove('is-hidden');
    }
}

export { FormstackIframe };
