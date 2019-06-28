// @flow
import fastdom from 'lib/fastdom-promise';
import crossIcon from 'svgs/icon/cross.svg';

const shouldRenderLabel = adSlotNode =>
    !(
        adSlotNode.classList.contains('ad-slot--fluid') ||
        adSlotNode.classList.contains('ad-slot--frame') ||
        adSlotNode.classList.contains('ad-slot--gc') ||
        adSlotNode.getAttribute('data-label') === 'false' ||
        adSlotNode.getElementsByClassName('ad-slot__label').length
    );

const createAdCloseDiv = (): HTMLButtonElement => {
    const closeDiv: HTMLButtonElement = document.createElement('button');
    closeDiv.className = 'ad-slot__close-button';
    closeDiv.innerHTML = crossIcon.markup;
    closeDiv.onclick = function onclickMobileStickyCloser() {
        const container = this.closest('.mobilesticky-container');
        if (container) container.remove();
    };
    return closeDiv;
};

const createAdLabel = (): HTMLDivElement => {
    const adLabel: HTMLDivElement = document.createElement('div');
    adLabel.className = 'ad-slot__label';
    adLabel.innerHTML = 'Advertisement';
    adLabel.appendChild(createAdCloseDiv());

    return adLabel;
};

export const renderAdvertLabel = (adSlotNode: HTMLElement): Promise<null> =>
    fastdom.read(() => {
        if (shouldRenderLabel(adSlotNode)) {
            return fastdom.write(() => {
                adSlotNode.prepend(createAdLabel());
            });
        }
    });
