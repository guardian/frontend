// @flow
/* eslint-disable camelcase */

// bespoke wrapper around preact's `h` that passes any CSS data
// on `attributes.style` to styletron, then hands off to `preact#h`

import { h as preact_h } from 'preact';
import { styled } from 'styletron-preact';
import { css } from 'emotion';

export default (
    component: string,
    attributes: ?Object,
    ...children: Array<any>
) => {
    const { style = {}, ...otherAttributes } = attributes || {};

    // cheapCSS and expensiveCSS are added by __tools__/ui-css-loader.js
    // after it analyses the CSS that's being loaded
    const { cheapCSS, expensiveCSS: emotionCSS, ...inlineStyles } = style;

    // if the style prop has been used normally, use those styles too
    // overriding what was imported cascade-style
    const styletronCSS = Object.assign({}, cheapCSS, inlineStyles);

    if (emotionCSS && Object.keys(emotionCSS).length) {
        otherAttributes.className = [css(emotionCSS), otherAttributes.className]
            .join(' ')
            .trim();
    }

    return preact_h(
        Object.keys(styletronCSS).length
            ? styled(component, styletronCSS)
            : component,
        otherAttributes,
        children
    );
};
