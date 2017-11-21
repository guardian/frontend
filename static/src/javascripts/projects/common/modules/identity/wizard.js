// @flow
/* eslint-disable no-underscore-dangle, react/sort-comp */

import bean from 'bean';
import { Component } from 'common/modules/component';

const stepClassname = 'manage-account-wizard__step';
const progressButtonClassname = 'manage-account-wizard__controls';
export const containerClassname = 'manage-account-wizard';

export class Wizard extends Component {
    position: number;
    steps: NodeList<HTMLElement>;
    el: HTMLElement;

    constructor() {
        super();
        this.componentClass = containerClassname;
    }

    updateCounter() {
        this.getElem('controls-pager').html(`${this.position} / ${this.steps.length}`);
    }

    setPosition(positionAt: number) {
        this.steps.forEach(stepEl => {
            stepEl.style.display = 'none';
        });
        if (this.steps[positionAt]) {
            this.position = positionAt;
            this.steps[positionAt].style.display = 'block';
            this.updateCounter();
        } else {
            this.steps[this.position].style.display = 'block';
            throw new Error('Invalid position');
        }
    }

    prerender() {
        super.prerender();

        this.steps = this.elem.querySelectorAll(`.${stepClassname}`);
        this.nextButtonEl = this.elem.querySelector(
            `.${progressButtonClassname}`
        );
    }

    ready() {
        this.setPosition(0);
        bean.on(this.nextButtonEl, 'click', () => {
            this.setPosition(this.position + 1);
        });
    }
}
