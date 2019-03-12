// @flow strict

import fastdom from 'lib/fastdom-promise';

type Rect = {
    top: number,
    height: number,
};

const calcShowcaseOffset = (showcaseRect: Rect, mainColRect: Rect): number => {
    const headlineHeight = showcaseRect.top - mainColRect.top;
    const showcaseHeight = showcaseRect.height;
    return headlineHeight + showcaseHeight;
};

export const fixSecondaryColumn = (): void => {
    const secondaryCol = document.querySelector('.js-secondary-column');
    const mainCol = document.querySelector('.js-content-main-column');
    const showcase = document.querySelector('.media-primary--showcase');

    if (!mainCol || !secondaryCol || !showcase) {
        return;
    }

    fastdom
        .read(() => {
            const mainColDim = mainCol.getBoundingClientRect();
            const showcaseDim = showcase.getBoundingClientRect();
            return calcShowcaseOffset(showcaseDim, mainColDim);
        })
        .then(offset =>
            fastdom.write(() => {
                secondaryCol.style.paddingTop = `${offset}px`;
            })
        );
};

export const _ = { calcShowcaseOffset };
