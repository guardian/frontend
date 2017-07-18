// @flow
/* eslint-disable global-require */
import { render as renderToString } from 'preact-render-to-string';
import { StyletronProvider } from 'styletron-preact';
import StyletronServer from 'styletron-server';

import head from 'layouts/head';
import Body from 'layouts/body';

const styletron = new StyletronServer();

// the main export for the JVM JS interpreter to run
// eslint-disable-next-line import/prefer-default-export
export const render = (props: Object) => {
    const body = renderToString(
        <StyletronProvider styletron={styletron}>
            <Body {...props} />
        </StyletronProvider>
    );

    return `
        <html lang="en">
            ${head(props, styletron.getStylesheetsHtml())}
            ${body}
        </html>
    `;
};
