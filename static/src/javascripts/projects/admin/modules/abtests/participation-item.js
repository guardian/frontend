// @flow
/*
 Module: participation-item.js
 Description: Displays opt-in link for a variant
 */
import { Component } from 'common/modules/component';

class ParticipationItem extends Component {
    constructor(config: Object): void {
        super();

        this.templateName = 'participation-item-template';
        this.componentClass = 'participation-item';
        this.classes = {};
        this.useBem = true;
        this.config = Object.assign(
            {
                test: '',
                examplePath: '',
                variant: '',
            },
            config
        );
    }

    prerender(): void {
        const origin = /gutools.co.uk$/.test(document.location.origin)
            ? 'http://www.theguardian.com'
            : document.location.origin;
        const href = `${this.config.examplePath}=${this.config.variant}`;
        this.elem.textContent = this.config.variant;
        this.elem.href = origin + href;
    }
}

export { ParticipationItem };
