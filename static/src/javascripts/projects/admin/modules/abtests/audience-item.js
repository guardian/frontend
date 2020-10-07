// @flow
/*
 Module: audience-item.js
 Description: Displays information about how the test users are divided.
 */
import { Component } from 'common/modules/component';

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

    config: Object;

    prerender(): void {
        const testEl = this.getElem('test');
        const testLabel = this.getElem('test-label');
        const captionTest = this.getElem('caption-test');
        const captionRange = this.getElem('caption-range');

        if (testLabel) {
            bonzo(testLabel).prepend(this.config.test.id);
        }

        // Set the width and absolute position to match the audience size and offset.
        const audience = this.config.test.audience * 100;
        const audienceOffset = this.config.test.audienceOffset * 100;
        const audienceEnd = audience + audienceOffset;

        if (testEl) {
            testEl.style.width = `${audience.toString()}%`;
            testEl.style.left = `${audienceOffset.toString()}%`;
        }

        if (captionTest) {
            bonzo(captionTest).append(this.config.test.id);
        }

        if (captionRange) {
            bonzo(captionRange).append(`${audienceOffset}% to ${audienceEnd}%`);
        }
    }
}

export { AudienceItem };
