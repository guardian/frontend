// @flow
/*
 Module: audience.js
 Description: Displays information about how the test users are divided.
 */
import { Component } from 'common/modules/component';
import { AudienceItem } from 'admin/modules/abtests/audience-item';

class Audience extends Component {
    constructor(config: Object): void {
        super();

        this.templateName = 'audience-template';
        this.componentClass = 'audience-breakdown';
        this.useBem = true;
        this.config = Object.assign(
            {
                tests: [],
            },
            config
        );
    }

    prerender(): void {
        const testsContainer = this.getElem('tests');

        this.config.tests.forEach(test => {
            new AudienceItem({
                test,
            }).render(testsContainer);
        });
    }
}

export { Audience };
