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

type FontWeight =
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | 'regular'
    | 'bold';

type FontStyle = 'italic' | 'normal';

type Webfont = {
    family: string,
    weight?: FontWeight,
    style?: FontStyle,
    url?: string,
};

/* in app article will send a message when ready to interact */
const comready = (callback: () => void): void => {
    window.addEventListener('message', function onM() {
        callback();
        window.removeEventListener('message', onM);
    });
};

const installWebfonts = (fonts: Webfont[]) => {
    const css = fonts
        .map(
            (font: Webfont): string => `
        @font-face {
          font-family: ${font.family};
          font-weight: ${font.weight || '400'};
          font-style: ${font.style || 'normal'};
          src: url(${font.url || ''});
        }
        `
        )
        .join('\n');
    (document.styleSheets[0]: window.CSSStyleSheet).insertRule(css);
};

const getWebfonts = (families: Webfont[]): Promise<void> =>
    new Promise(resolve => {
        const msgId = send('get-webfonts', families);
        window.addEventListener('message', function onM(evt) {
            if (!(evt instanceof MessageEvent)) {
                return;
            }
            const { id, error, result } = JSON.parse(evt.data);
            if (id !== msgId) {
                return;
            }
            if (error) {
                throw new Error(error);
            }
            window.removeEventListener('message', onM);
            installWebfonts(result);
            resolve();
        });
    });

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
            send('resize', { height });
        });
    getWebfonts([
        { family: 'Guardian Text Egyptian Web', weight: 'bold' },
        { family: 'Guardian Text Egyptian Web', weight: 'regular' },
    ]);
});
