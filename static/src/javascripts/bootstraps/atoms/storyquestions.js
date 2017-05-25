// @flow

import domready from 'domready';
import config from 'lib/config';
import { init } from 'common/modules/atoms/story-questions';
import fastdom from 'lib/fastdom-promise';
import post from 'commercial/modules/messenger/post-message';

// let webpack know where to get files from
// __webpack_public_path__ is a special webpack variable
// https://webpack.js.org/guides/public-path/#set-value-on-the-fly
// eslint-disable-next-line camelcase,no-undef
__webpack_public_path__ = `${config.page.assetsPath}javascripts/`;

const resizeMessage = (payload: Object): Object => ({
    id: window.name,
    type: 'resize',
    value: payload,
});

/* in app article will send a message when ready to interact */
const comready = (callback: () => void): void => {
    window.addEventListener('message', function onM() {
        callback();
        window.removeEventListener('message', onM);
    });
};

Promise.all([
    window.guardian.polyfilled
        ? Promise.resolve()
        : new Promise(resolve => {
              window.guardian.onPolyfilled = resolve;
          }),
    new Promise(resolve => domready(resolve)),
    new Promise(resolve => comready(resolve)),
]).then(() => {
    init();
    fastdom
        .read(
            () =>
                document.documentElement &&
                document.documentElement.getBoundingClientRect().height
        )
        .then(height => {
            post(resizeMessage({ height }), window.top, '*');
        });
});
