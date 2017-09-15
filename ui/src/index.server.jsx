// @flow
/* eslint-disable global-require */
import { render as renderToString } from 'preact-render-to-string';
import { StyletronProvider } from 'styletron-preact';
import StyletronServer from 'styletron-server';
import { extractCritical } from 'emotion-server';

import head from 'components/head';
import Body from 'components/body';

// this should be managed by a route somehow
import Application from 'views/404';

const styletron = new StyletronServer();

// the main export for the JVM JS interpreter to run
// eslint-disable-next-line import/prefer-default-export
export const render = (props: Object) => {
    const body = renderToString(
        <StyletronProvider styletron={styletron}>
            <Body {...props}>
                <Application {...props} />
            </Body>
        </StyletronProvider>
    );

    return `
        <!DOCTYPE html>
        <html lang="en">
            ${head(
                props,
                [
                    styletron.getStylesheetsHtml(),
                    `<style expensive-css>${extractCritical(body).css}</style>`,
                ].join('\n')
            )}
            ${body}
        </html>
    `.trim();
};
