import fastdom from 'lib/fastdom-promise';

export const hideElement =(element: Element) =>
    fastdom.mutate(() => element.classList.add('u-h'));
