// @flow
import fastdom from 'lib/fastdom-promise';

const shouldRenderLabel = adSlotNode =>
    !(
        adSlotNode.classList.contains('ad-slot--fluid') ||
        adSlotNode.classList.contains('ad-slot--frame') ||
        adSlotNode.classList.contains('ad-slot--gc') ||
        adSlotNode.getAttribute('data-label') === 'false' ||
        adSlotNode.getElementsByClassName('ad-slot__label').length
    );

const createAdCloseDiv = (): HTMLDivElement => {
    const closeDiv: HTMLDivElement = document.createElement('div');
    closeDiv.className = 'mobilesticky-closer';
    closeDiv.innerHTML =
        '<svg viewbox="0 0 40 40"><path class="mobilesticky-container_close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" /></svg>';
    closeDiv.onclick = function onclickMobileStickyCloser() {
        this.closest('.mobilesticky-container').remove();
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
