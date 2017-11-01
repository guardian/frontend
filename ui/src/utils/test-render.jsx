// @flow
import { server } from '@guardian/guui';

const app = server();

export default (content: any) => {
    const html = app.renderToString(content);

    // TODO: it would be nice to capture CSS as part of snapshot
    // const css = app.extractCriticalCss(html);

    it('generates the expected markup', () => {
        expect({ html }).toMatchSnapshot();
    });
};
