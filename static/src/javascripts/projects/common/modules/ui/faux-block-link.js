// @flow

import bean from 'bean';
import fastdom from 'fastdom';

const overlaySelector = '.u-faux-block-link__overlay';
const hoverStateClassName = 'u-faux-block-link--hover';

const showIntentToClick = (e: Event): void => {
    fastdom.write(() => {
        if ((e.currentTarget: any).parentElement) {
            (e.currentTarget: any).parentElement.classList.add(
                hoverStateClassName
            );
        }
    });
};

const removeIntentToClick = (e: Event): void => {
    fastdom.write(() => {
        if ((e.currentTarget: any).parentElement) {
            (e.currentTarget: any).parentElement.classList.remove(
                hoverStateClassName
            );
        }
    });
};

const fauxBlockLink = (): void => {
    // mouseover
    bean.on(document.body, 'mouseenter', overlaySelector, showIntentToClick);
    // mouseout
    bean.on(document.body, 'mouseleave', overlaySelector, removeIntentToClick);
};

export { fauxBlockLink };
