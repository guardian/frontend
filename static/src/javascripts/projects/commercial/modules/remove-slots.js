import once from 'lodash/once';
import fastdom from '../../../lib/fastdom-promise';
import { dfpEnv } from './dfp/dfp-env';

// Remove ad slots
// Remove toggled ad labels that sit outside of the ad slot
const selectors = [
    dfpEnv.adSlotSelector,
    '.ad-slot__label--toggle',
];

const selectNodes = () =>
    selectors.reduce((nodes, selector) =>
        [...nodes, ...Array.from(document.querySelectorAll(selector))]
    , []);

const isDisabled = node =>
    window.getComputedStyle(node).display === 'none';

const filterDisabledNodes = nodes =>
    nodes.filter(isDisabled);

const removeNodes = nodes =>
    fastdom.mutate(() => nodes.forEach((node) => node.remove()));

const removeAdSlots = () =>
    removeNodes(selectNodes());

const removeDisabledAdSlots = () =>
    removeNodes(filterDisabledNodes(selectNodes()));

const removeSlots = () => removeAdSlots();

const removeDisabledSlots = once(() => removeDisabledAdSlots());

export { removeSlots, removeDisabledSlots };
