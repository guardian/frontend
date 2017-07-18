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
            container
        );
    }
};

if (module.hot) {
    // chillout flow
    // $FlowFixMe
    module.hot.accept();
}

renderApp();
