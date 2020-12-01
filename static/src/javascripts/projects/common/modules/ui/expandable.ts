/*
    Module: expandable.js
    Description: Used to make a list of items expand and contract
*/

type Options = {
    dom: HTMLElement;
    expanded?: boolean;
    showCount?: boolean;
    buttonAfterEl?: HTMLElement;
};

class Expandable {
    opts: Options;

    dom: Element;

    cta: Element;

    expanded: boolean;

    showCount: boolean;

    constructor(options: Options) {
        this.opts = options;
        this.dom = options.dom;
        this.expanded = options.expanded;
        this.cta = document.createElement('button');
        this.showCount = options.showCount;
    }

    renderState(): void {
        if (this.expanded) {
            this.dom.classList.remove('shut');
        } else {
            this.dom.classList.add('shut');
        }
    }

    getCount(): number {
        return parseInt(this.dom.getAttribute('data-count') || '0', 10);
    }

    updateCallToAction(): void {
        const text = `Show ${this.showCount ? `${this.getCount()} ` : ''}${
            this.expanded ? 'fewer' : 'more'
        }`;
        this.cta.innerHTML = text;
        this.cta.setAttribute(
            'data-link-name',
            `Show ${this.expanded ? 'more' : 'fewer'}`
        );
        this.cta.setAttribute('data-is-ajax', '1');
    }

    toggleExpanded(): void {
        this.expanded = !this.expanded;
        this.renderState();
        this.updateCallToAction();
    }

    isOpen(): boolean {
        return !this.dom.classList.contains('shut');
    }

    renderCallToAction(): void {
        this.cta.addEventListener('click', () => {
            this.toggleExpanded();
        });
        this.cta.className = 'cta';
        if (this.opts.buttonAfterEl) {
            this.opts.buttonAfterEl.insertAdjacentElement('afterend', this.cta);
        } else {
            this.dom.appendChild(this.cta);
        }
        this.updateCallToAction();
    }

    scrollToCallToAction(): void {
        // feels a bit hacky but need to give the transition time to finish before scrolling
        if (!this.expanded) {
            window.setTimeout(() => {
                this.cta.scrollIntoView();
            }, 550);
        }
    }

    init(): void {
        if (
            this.dom.classList.contains('expandable-initialised') ||
            !this.dom.innerHTML ||
            this.getCount() < 3
        ) {
            return;
        }
        this.dom.classList.add('expandable-initialised');

        this.renderCallToAction();
        this.renderState();
    }

    toggle(): void {
        this.toggleExpanded();
    }
}

export { Expandable };
