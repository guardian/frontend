// @flow
/* eslint-disable no-underscore-dangle, react/sort-comp */

import bean from 'bean';
import $ from 'lib/$';
import { Component } from 'common/modules/component';

const stepClassname = 'manage-account-wizard__step';
const nextButtonElClassname = 'js-manage-account-wizard__next';
const prevButtonClassname = 'js-manage-account-wizard__prev';
export const containerClassname = 'manage-account-wizard';

export class Wizard extends Component {
    position: number;
    steps: NodeList<HTMLElement>;
    nextButtonEls: NodeList<HTMLElement>;
    prevButtonEls: NodeList<HTMLElement>;

    constructor(): void {
        super();
        this.useBem = true;
        this.componentClass = containerClassname;
    }

    updateCounter(): void {
        if (this.position >= this.steps.length - 1) {
            this.setState('completed');
        } else {
            this.removeState('completed');
        }

        const pagerEl = this.getElem('controls-pager');
        if (pagerEl) {
            pagerEl.innerText = `${this.position + 1} / ${this.steps.length}`;
        }
    }

    setPosition(positionAt: number): void {
        this.steps.forEach(stepEl => {
            stepEl.style.display = 'none';
        });
        if (positionAt < 0) {
            return this.setPosition(0);
        }
        if (this.steps[positionAt]) {
            this.position = positionAt;
            this.steps[positionAt].style.display = 'block';
            this.updateCounter();
        } else {
            this.steps[this.position].style.display = 'block';
            throw new Error('Invalid position');
        }
    }

    prerender(): void {
        super.prerender();

        if (!this.elems) this.elems = {};

        this.steps = $(`.${stepClassname}`, this.elem);
        this.nextButtonEls = $(`.${nextButtonElClassname}`, this.elem);
        this.prevButtonEls = $(`.${prevButtonClassname}`, this.elem);
    }

    ready(): void {
        this.setPosition(0);
        if (this.nextButtonEls)
            this.nextButtonEls.forEach(elem => {
                bean.on(elem, 'click', () => {
                    this.setPosition(this.position + 1);
                });
            });
        if (this.prevButtonEls)
            this.prevButtonEls.forEach(elem => {
                bean.on(elem, 'click', () => {
                    this.setPosition(this.position - 1);
                });
            });
    }
}
