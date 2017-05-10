// @flow
import qwery from 'qwery';

import bean from 'bean';

import fastdom from 'fastdom';

const onKeyPress = handler => event => {
    if (event.keyCode === 0x20 || event.keyCode === 0x0d) {
        handler(event);
    }
};

const onOpenClick = event => {
    const summary = event.currentTarget;
    const details = summary.parentNode;
    const label = summary.querySelector('.js-button__label');
    if (details.hasAttribute('open')) {
        fastdom.write(() => {
            label.textContent = `More ${summary.getAttribute('data-text')}`;
        });
    } else {
        fastdom.write(() => {
            label.textContent = 'Less';
        });
    }
};

const paidContainers = () => {
    const showMores = qwery('.adverts__more > summary');
    bean.on(document, 'click', showMores, onOpenClick);
    bean.on(document, 'click', showMores, onKeyPress(onOpenClick));

    return Promise.resolve();
};

export { paidContainers };
