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

export const renderStickyAdLabel = (adSlotNode: HTMLElement): Promise<null> =>
    fastdom.write(() => {
        const adSlotLabel = document.createElement('div');
        adSlotLabel.classList.add('ad-slot__label');
        adSlotLabel.classList.add('sticky');
        adSlotLabel.innerHTML = 'Advertisement';
        adSlotNode.appendChild(adSlotLabel);
    });

export const renderStickyScrollForMoreLabel = (
    adSlotNode: HTMLElement
): Promise<null> =>
    fastdom.write(() => {
        const scrollForMoreLabel = document.createElement('div');
        scrollForMoreLabel.classList.add('ad-slot__scroll');
        scrollForMoreLabel.innerHTML = 'Scroll for More';
        scrollForMoreLabel.onclick = (event) => {
            adSlotNode.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            });
            event.preventDefault();
        };
        adSlotNode.appendChild(scrollForMoreLabel);
    });
