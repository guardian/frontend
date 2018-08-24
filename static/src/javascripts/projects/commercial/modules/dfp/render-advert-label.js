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

export const renderAdvertLabel = (adSlotNode: HTMLElement): Promise<null> =>
    fastdom.read(() => {
        if (shouldRenderLabel(adSlotNode)) {
            const labelDiv = `<div class="ad-slot__label">Advertisement</div>`;
            return fastdom.write(() => {
                adSlotNode.insertAdjacentHTML('afterbegin', labelDiv);
            });
        }
    });
