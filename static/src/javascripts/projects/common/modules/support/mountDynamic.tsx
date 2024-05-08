import { render } from 'react-dom';
import * as emotionReact from '@emotion/react';
import * as emotionReactJsxRuntime from '@emotion/react/jsx-runtime';
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache';
import * as preactCompat from 'preact/compat';
import React from 'react';

interface Automat {
    react: any;
    preact: any;
    emotionReact: any;
    emotionReactJsxRuntime: any;
}

declare global {
    interface Window {
        guardian?: { automat?: Automat };
    }
}

window.guardian = window.guardian || {};

window.guardian.automat = window.guardian.automat || {
    react: preactCompat,
    preact: preactCompat,
    emotionReact,
    emotionReactJsxRuntime,
};

// mountDynamic mounts a react (preact) element to a DOM element.
//
// To save resources, Automat provides Preact's renderElement and @emotion/core out of the box.
// Modules should alias imports for these to use the provided versions. See
// types of the global `automat` object for exact details here.
export const mountDynamic = <A extends {}>(
    el: HTMLElement,
    Component: React.FC<A>,
    props: A,
    attachShadow = false,
): void => {
    if (!attachShadow || !el.attachShadow) {
        render(<Component {...props} />, el);
        return;
    }

    const shadowRoot = el.attachShadow({ mode: 'open' });
    const inner = shadowRoot.appendChild(document.createElement('div'));

    const emotionCache = createCache({ key: 'automat', container: inner });
    const cached = (
        <CacheProvider value={emotionCache}>
            <Component {...props} />
        </CacheProvider>
    );

    render(cached, inner);
};
