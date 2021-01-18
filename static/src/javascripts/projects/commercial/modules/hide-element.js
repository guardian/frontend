import fastdom from 'lib/fastdom-promise';

export const hideElement =(element) =>
    fastdom.mutate(() => element.classList.add('u-h'));
