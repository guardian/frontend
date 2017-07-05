// @flow

import domready from 'domready';
import { comready } from 'lib/comready';
import config from 'lib/config';
import { init } from 'common/modules/atoms/story-questions';
import fastdom from 'lib/fastdom-promise';
import { send } from 'commercial/modules/messenger/send';

// let webpack know where to get files from
// __webpack_public_path__ is a special webpack variable
// https://webpack.js.org/guides/public-path/#set-value-on-the-fly
// eslint-disable-next-line camelcase,no-undef
__webpack_public_path__ = `${config.page.assetsPath}javascripts/`;

Promise.all([
    window.guardian.polyfilled
        ? Promise.resolve()
        : new Promise(resolve => {
              window.guardian.onPolyfilled = resolve;
          }),
    new Promise(domready),
    new Promise(comready),
]).then(() => {
    init();
    fastdom
        .read(
            () =>
                document.documentElement &&
                document.documentElement.getBoundingClientRect().height
        )
        .then(height => {
            send('resize', { height });
        });
});
