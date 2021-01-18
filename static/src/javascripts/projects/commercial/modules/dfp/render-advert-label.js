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

const createAdCloseDiv = () => {
    const closeDiv = document.createElement('button');
    closeDiv.className = 'ad-slot__close-button';
    closeDiv.innerHTML = crossIcon.markup;
    closeDiv.onclick = function onclickMobileStickyCloser() {
        const container = this.closest('.mobilesticky-container');
        if (container) container.remove();
    };
    return closeDiv;
};

const createAdLabel = () => {
    const adLabel = document.createElement('div');
    adLabel.className = 'ad-slot__label';
    adLabel.innerHTML = 'Advertisement';
    adLabel.appendChild(createAdCloseDiv());
    return adLabel;
};

export const renderAdvertLabel = (adSlotNode) =>
    fastdom.measure(() => {
        if (shouldRenderLabel(adSlotNode)) {
            return fastdom.mutate(() => {
                adSlotNode.prepend(createAdLabel());
            });
        }
    });

export const renderStickyAdLabel = (adSlotNode) =>
    fastdom.mutate(() => {
        const adSlotLabel = document.createElement('div');
        adSlotLabel.classList.add('ad-slot__label');
        adSlotLabel.classList.add('sticky');
        adSlotLabel.innerHTML = 'Advertisement';
        adSlotNode.appendChild(adSlotLabel);
    });

export const renderStickyScrollForMoreLabel = (
    adSlotNode
) =>
    fastdom.mutate(() => {
        const scrollForMoreLabel = document.createElement('div');
        scrollForMoreLabel.classList.add('ad-slot__scroll');
        scrollForMoreLabel.innerHTML = 'Scroll for More';
        scrollForMoreLabel.onclick = event => {
            adSlotNode.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
            event.preventDefault();
        };
        adSlotNode.appendChild(scrollForMoreLabel);
    });
