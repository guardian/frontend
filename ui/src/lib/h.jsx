// @flow
/* eslint-disable camelcase */

// bespoke wrapper around preact's `h` that passes any CSS data
// on `attributes.style` to styletron, then hands off to `preact#h`

import { styled } from 'styletron-preact';
// $FlowFixMe - no idea why flow cannot find preact...
import { h as preact_h } from 'preact';

export default (
    nodeName: String,
    attributes: ?Object,
    ...children: Array<any>
) => {
    const { style, ...otherAttributes } = attributes || {};
    if (style) return preact_h(styled(nodeName, style), otherAttributes, children);
    return preact_h(nodeName, otherAttributes, children);
};
