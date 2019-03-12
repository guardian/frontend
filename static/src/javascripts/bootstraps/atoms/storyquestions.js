// @flow

import domready from 'domready';
import { comready } from 'lib/comready';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import { send } from 'commercial/modules/messenger/send';

// let webpack know where to get files from
// __webpack_public_path__ is a special webpack variable
// https://webpack.js.org/guides/public-path/#set-value-on-the-fly
// eslint-disable-next-line camelcase,no-undef
__webpack_public_path__ = `${config.get('page.assetsPath')}javascripts/`;

const updateHeight = () => {
    fastdom
        .read(
            () =>
                document.documentElement &&
                document.documentElement.getBoundingClientRect().height
        )
        .then(height => {
            send('resize', { height });
        });
};

Promise.all([
    window.guardian.polyfilled
        ? Promise.resolve()
        : new Promise(resolve => {
              window.guardian.onPolyfilled = resolve;
          }),
    new Promise(domready),
    new Promise(comready),
]).then(() => {
    updateHeight();

    // Brittle but will work
    Array.from(document.getElementsByClassName('user__question'))
        .slice(0, 1)
        .forEach((sq: Element) => {
            new MutationObserver(updateHeight).observe(sq, {
                childList: true,
                subtree: true,
            });
        });
});
