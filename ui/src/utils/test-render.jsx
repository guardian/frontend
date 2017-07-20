// @flow
import { render as renderToString } from 'preact-render-to-string';
import { StyletronProvider } from 'styletron-preact';
import StyletronServer from 'styletron-server';

const styletron = new StyletronServer();

export default (content: any) => {
    const html = renderToString(
        <StyletronProvider styletron={styletron}>
            {content}
        </StyletronProvider>
    );

    it('generates the expected markup', () => {
        expect({ html, css: styletron.getStylesheetsHtml() }).toMatchSnapshot();
    });
};
