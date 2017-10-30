// @flow
/* eslint-env browser */
import { render } from '@guardian/guui';

import Body from 'components/body';

// this should be managed by a route somehow
import Application from 'views/404';

const container: ?Element = document.body;

const renderApp = () => {
    const props = window.guardian;

    if (container) {
        render(
            <Body {...props}>
                <Application {...props} />
            </Body>,
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
