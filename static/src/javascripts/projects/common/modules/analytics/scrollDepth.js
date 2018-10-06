// @flow

import mediator from 'lib/mediator';
import debounce from 'lodash/debounce';

const timeSince = (time: number): number => new Date().getTime() - time;

const getPercentageInViewPort = (el: HTMLElement): ?number => {
    if (document.body) {
        const height = window.innerHeight || document.body.clientHeight;
        const rect = el.getBoundingClientRect();

        if (rect.bottom < 0 || rect.bottom < height) {
            return 100;
        } else if (rect.top > height) {
            return 0;
        } else if (rect.top > 0) {
            return (100 / (rect.height || 1)) * (height - rect.top);
        }

        return (100 / (rect.height || 1)) * (Math.abs(rect.top) + height);
    }
};

class ScrollDepth {
    opts: Object;
    data: Object;
    timeoutId: number;

    constructor(options: Object): void {
        this.opts = Object.assign(
            {},
            {
                changeThreshold: 10,
                isContent: false,
                pageEl: document.body,
            },
            options
        );

        this.data = {
            page: {
                start: new Date().getTime(),
                depth: 0,
                duration: 0,
            },
            content: {
                depth: 0,
            },
        };

        this.init();
    }

    setData(type: string): boolean {
        const el = this.opts[`${type}El`];

        if (!el) {
            return false;
        }

        const currentDepth = getPercentageInViewPort(el);

        if (
            currentDepth &&
            currentDepth - this.data[type].depth > this.opts.changeThreshold
        ) {
            this.data[type].depth = currentDepth;

            if (typeof this.data[type].duration === 'number') {
                this.data[type].duration = timeSince(this.data[type].start);
            }

            return true;
        }
        return false;
    }

    hasDataChanged(): void {
        const page = this.setData('page');
        const content = this.opts.isContent ? this.setData('content') : false;

        if (page || content) {
            this.log();
        }
    }

    assertScrolling(): void {
        if (typeof this.timeoutId === 'number') {
            window.clearTimeout(this.timeoutId);
        }

        this.timeoutId = window.setTimeout(() => {
            mediator.emit('scrolldepth:inactive');
        }, 1000);
    }

    log(): void {
        mediator.emit('scrolldepth:data', this.data);
    }

    init(): void {
        mediator.on(
            'window:throttledScroll',
            debounce(() => {
                this.assertScrolling();
            }, 200)
        );
        mediator.on('scrolldepth:inactive', () => {
            this.hasDataChanged();
        });
        mediator.on('module:clickstream:click', () => {
            this.hasDataChanged();
        });
    }
}

export { ScrollDepth };
