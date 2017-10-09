// @flow
/*
 Module: audience-item.js
 Description: Displays information about how the test users are divided.
 */
import { Component } from 'common/modules/component';
import bonzo from 'bonzo';

class AudienceItem extends Component {
    constructor(config: Object): void {
        super();

        this.templateName = 'audience-item-template';
        this.componentClass = 'audience-item';
        this.useBem = true;
        this.config = Object.assign(
            {
                test: {},
            },
            config
        );
    }

    prerender(): void {
        bonzo(this.getElem('test-label')).prepend(this.config.test.id);

        // Set the width and absolute position to match the audience size and offset.
        const audience = this.config.test.audience * 100;
        const audienceOffset = this.config.test.audienceOffset * 100;
        const audienceEnd = audience + audienceOffset;

        this.getElem('test').style.width = `${audience.toString()}%`;
        this.getElem('test').style.left = `${audienceOffset.toString()}%`;

        bonzo(this.getElem('caption-test')).append(this.config.test.id);
        bonzo(this.getElem('caption-range')).append(
            `${audienceOffset}% to ${audienceEnd}%`
        );
    }
}

export { AudienceItem };
