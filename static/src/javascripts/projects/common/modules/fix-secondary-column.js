

import fastdom from 'lib/fastdom-promise';


const calcShowcaseOffset = (showcaseRect, mainColRect) => {
    const headlineHeight = showcaseRect.top - mainColRect.top;
    const showcaseHeight = showcaseRect.height;
    return headlineHeight + showcaseHeight;
};

export const fixSecondaryColumn = () => {
    const secondaryCol = document.querySelector('.js-secondary-column');
    const mainCol = document.querySelector('.js-content-main-column');
    const showcase = document.querySelector('.media-primary--showcase');

    if (!mainCol || !secondaryCol || !showcase) {
        return;
    }

    fastdom
        .measure(() => {
            const mainColDim = mainCol.getBoundingClientRect();
            const showcaseDim = showcase.getBoundingClientRect();
            return calcShowcaseOffset(showcaseDim, mainColDim);
        })
        .then(offset =>
            fastdom.mutate(() => {
                secondaryCol.style.paddingTop = `${offset}px`;
            })
        );
};

export const _ = { calcShowcaseOffset };
