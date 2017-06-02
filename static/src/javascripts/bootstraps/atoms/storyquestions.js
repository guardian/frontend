// @flow

import domready from 'domready';
import config from 'lib/config';
import { init } from 'common/modules/atoms/story-questions';
import fastdom from 'lib/fastdom-promise';
import { send } from 'commercial/modules/messenger/send';

// let webpack know where to get files from
// __webpack_public_path__ is a special webpack variable
// https://webpack.js.org/guides/public-path/#set-value-on-the-fly
// eslint-disable-next-line camelcase,no-undef
__webpack_public_path__ = `${config.page.assetsPath}javascripts/`;

const comready = (resolve, reject) => {
    const MAX_COUNT = 5;
    let count = 0;
    send('syn', true);
    const intId = setInterval(() => {
        count += 1;
        if (count === MAX_COUNT) {
            clearInterval(intId);
            reject(new Error('Failed to reach page messenger'));
        }
        send('syn', true);
    }, 500);
    window.addEventListener('message', evt => {
        if (JSON.parse(evt.data).result !== 'ack') {
            return;
        }
        clearInterval(intId);
        resolve();
    });
};

Promise.all([
    window.guardian.polyfilled
        ? Promise.resolve()
        : new Promise(resolve => {
              window.guardian.onPolyfilled = resolve;
          }),
    new Promise(resolve => domready(resolve)),
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
