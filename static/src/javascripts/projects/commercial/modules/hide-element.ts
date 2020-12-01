import fastdom from 'lib/fastdom-promise';

export const hideElement = <T extends Element>(element: T): Promise<T> =>
    fastdom.mutate(() => element.classList.add('u-h'));
