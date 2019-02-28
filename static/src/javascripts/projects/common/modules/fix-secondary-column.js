// @flow

import fastdom from 'lib/fastdom-promise';

type Dim = {
    top: number,
    left: number,
    height: number,
    width: number,
};

const calcShowcaseOffset = (showcaseDim: Dim, maincolDim: Dim): number => {
    const headlineHeight = showcaseDim.top - maincolDim.top;
    const showcaseHeight = showcaseDim.height;
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
