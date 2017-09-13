// @flow
/* eslint-disable camelcase */

// bespoke wrapper around preact's `h` that passes any CSS data
// on `attributes.style` to styletron, then hands off to `preact#h`

import { h as preact_h } from 'preact';
import { styled as cheaplyStyled } from 'styletron-preact';
import { expensivelyStyled } from 'utils/expensively-styled';

export default (
    component: string,
    attributes: ?Object,
    ...children: Array<any>
) => {
    const { style, __expensiveStyle__, ...otherAttributes } = attributes || {};

    if (__expensiveStyle__) {
        component = expensivelyStyled(component, __expensiveStyle__);
    }

    if (style) {
        component = cheaplyStyled(component, style);
    }

    return preact_h(component, otherAttributes, children);
};
