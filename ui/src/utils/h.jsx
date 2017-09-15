// @flow
/* eslint-disable camelcase */

// bespoke wrapper around preact's `h` that passes any CSS data
// on `attributes.style` to styletron, then hands off to `preact#h`

import { h as preact_h } from 'preact';
import { styled } from 'styletron-preact';

export default (
    component: string,
    attributes: ?Object,
    ...children: Array<any>
) => {
    const { style, ...otherAttributes } = attributes || {};

    return preact_h(
        style ? styled(component, style) : component,
        otherAttributes,
        children
    );
};
