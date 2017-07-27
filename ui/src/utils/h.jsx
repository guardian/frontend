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
    const { style, 'style-root': styleRoot, ...otherAttributes } =
        attributes || {};

    if (styleRoot) {
        otherAttributes.className = [otherAttributes.className, 'reset']
            .join(' ')
            .trim();
    }

    if (style) {
        return preact_h(styled(nodeName, style), otherAttributes, children);
    }
    const node = style ? styled(nodeName, style) : nodeName;

    return preact_h(node, otherAttributes, children);
};
