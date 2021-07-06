import { amIUsed } from 'commercial/sentinel';
import fastdom from '../../../lib/fastdom-promise';

export const hideElement = (element) => {
    amIUsed('hide-element', 'hideElement')
    return fastdom.mutate(() => element.classList.add('u-h'));
}
