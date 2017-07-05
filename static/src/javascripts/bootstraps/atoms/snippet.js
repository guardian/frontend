// @flow

import domready from 'domready';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import { comready } from 'lib/comready';
import { send } from 'commercial/modules/messenger/send';
import { SnippetFeedback } from 'journalism/snippet-feedback';

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
    SnippetFeedback({ scroll: false });
    [...document.getElementsByTagName('details')]
        .slice(0, 1)
        .forEach(details => {
            new MutationObserver((changes: MutationRecord[]) => {
                changes.forEach((change: MutationRecord) => {
                    if (change.attributeName !== 'open') return;
                    fastdom
                        .read(
                            () =>
                                (document.documentElement &&
                                    document.documentElement.getBoundingClientRect()
                                        .height) ||
                                0
                        )
                        .then(height => send('resize', { height }));
                });
            }).observe(details, { attributes: true });
        });
});
