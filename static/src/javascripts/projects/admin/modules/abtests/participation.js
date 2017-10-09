// @flow
/*
 Module: participation.js
 Description: Displays opt-in and opt-out links for a test
 */
import { Component } from 'common/modules/component';
import { ParticipationItem } from 'admin/modules/abtests/participation-item';

class Participation extends Component {
    constructor(config: Object): void {
        super();

        this.templateName = 'participation-template';
        this.componentClass = 'participation';
        this.useBem = true;
        this.config = Object.assign(
            {
                test: '',
            },
            config
        );
    }

    prerender(): void {
        const test = this.config.test;
        const origin = /gutools.co.uk$/.test(document.location.origin)
            ? 'http://www.theguardian.com'
            : document.location.origin;
        const examplePath = `${test.examplePath || '/uk'}#ab-${test.id}`;

        this.getElem('opt-out').href = `${origin}${examplePath}=notintest`;

        const linksContainer = this.getElem('links');

        test.variants.forEach(variant => {
            new ParticipationItem({
                test: test.id,
                examplePath,
                variant: variant.id,
            }).render(linksContainer);
        });
    }
}

export { Participation };
