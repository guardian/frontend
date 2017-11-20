// @flow
/* eslint-disable no-underscore-dangle */

import bean from 'bean';

const stepClassname = 'manage-account__wizard-step';
const progressButtonClassname = 'manage-account__wizard-controls';
export const containerClassname = 'manage-account__wizard';

export class Wizard {
    position: number;
    steps: NodeList<HTMLElement>;
    el: HTMLElement;

    setPosition(positionAt: number) {
        this.steps.forEach(stepEl => {
            stepEl.style.display = 'none';
        });
        if (this.steps[positionAt]) {
            this.position = positionAt;
            this.steps[positionAt].style.display = 'block';
        } else {
            this.steps[this.position].style.display = 'block';
            throw new Error('Invalid position');
        }
    }

    constructor(wizardEl: HTMLElement) {
        this.el = wizardEl;
        this.steps = wizardEl.querySelectorAll(`.${stepClassname}`);
        this.setPosition(0);

        const nextButtonEl = wizardEl.querySelector(
            `.${progressButtonClassname}`
        );

        bean.on(nextButtonEl, 'click', () => {
            this.setPosition(this.position + 1);
        });
    }
}
