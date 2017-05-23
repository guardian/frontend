// @flow

import domready from 'domready';
import config from 'lib/config';

// let webpack know where to get files from
// __webpack_public_path__ is a special webpack variable
// https://webpack.js.org/guides/public-path/#set-value-on-the-fly
// eslint-disable-next-line camelcase,no-undef
__webpack_public_path__ = `${config.page.assetsPath}javascripts/`;

// kick off the app
const go = () => {
    domready(() => {
        require.ensure(
            [],
            // webpack needs the require function to be called 'require'
            // eslint-disable-next-line no-shadow
            require => {
                require(`bootstraps/atoms/${config.page.atomType}`)();
            },
            'atom'
        );
    });
};

// make sure we've patched the env before running the app
if (window.guardian.polyfilled) {
    go();
} else {
    window.guardian.onPolyfilled = go;
}
