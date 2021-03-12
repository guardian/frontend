import React from "react"
import { render } from 'react-dom';
import * as emotionCore from '@emotion/core';
import { CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import * as preactCompat from 'preact/compat';

window.guardian.automat = window.guardian.automat || {
    preact: preactCompat,
    emotionCore: emotionCore,
};

// mountDynamic mounts a react (preact) element to a DOM element.
//
// To save resources, Automat provides Preact's renderElement and @emotion/core out of the box.
// Modules should alias imports for these to use the provided versions. See
// types of the global `automat` object for exact details here.
export const mountDynamic = (el, Component, props, attachShadow = false) => {
    if (!attachShadow || !el.attachShadow) {
        render(<Component {...props} />, el);
        return;
    }

    const shadowRoot = el.attachShadow({ mode: 'open' });
    const inner = shadowRoot.appendChild(document.createElement('div'));

    const emotionCache = createCache({ container: inner });
    const cached = (
        <CacheProvider value={emotionCache}>
            <Component {...props} />
        </CacheProvider>
    );

    render(cached, inner);
};
