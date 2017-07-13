// @flow
import { render } from 'preact';
import { StyletronProvider } from 'styletron-preact';
import StyletronClient from 'styletron-client';

import Body from 'layouts/body';

const container: ?Element = document.body;

const renderApp = () => {
    const props = window.guardian;

    if (container) {
        render(
            <StyletronProvider
                styletron={
                    new StyletronClient(
                        document.getElementsByClassName('_styletron_hydrate_')
                    )
                }
            >
                <Body {...props} />
            </StyletronProvider>,
            container.parentElement,
            // preact uses react's flowtype definition for `render`, which is weird,
            // given https://preactjs.com/guide/differences-to-react#what-s-different-
            // $FlowFixMe
            container
        );
    }
};

if (module.hot) {
    module.hot.accept();
}

renderApp();
