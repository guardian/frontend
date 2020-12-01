/*
 Module: audience.js
 Description: Displays information about how the test users are divided.
 */
import { AudienceItem } from 'admin/modules/abtests/audience-item';
import { Component } from 'common/modules/component';

class Audience extends Component {
    constructor(config: Object): void {
        super();

        this.templateName = 'audience-template';
        this.componentClass = 'audience-breakdown';
        this.useBem = true;
        this.config = {
            tests: [],
            ...config,
        };
    }

    config: Object;

    prerender(): void {
        const testsContainer = this.getElem('tests');

        this.config.tests.forEach((test) => {
            new AudienceItem({
                test,
            }).render(testsContainer);
        });
    }
}

export { Audience };
