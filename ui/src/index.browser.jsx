// @flow
import { render } from 'preact';
import { StyletronProvider } from 'styletron-preact';
import StyletronClient from 'styletron-client';

import Body from 'components/body';

// this should be managed by a route somehow
import Application from 'views/404';

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
                }>
                <Body {...props}>
                    <Application {...props} />
                </Body>
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

    // $FlowFixMe
    require('preact/devtools'); // eslint-disable-line
}

renderApp();
