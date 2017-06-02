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

const MAX_COUNT = 5;

const comready = (resolve, reject) => {
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

const installWebfonts = (fonts: Webfont[]) => {
    const styles = (document.createElement('style'): window.HTMLStyleElement);
    if (document.head) {
        document.head.appendChild(styles);
    }
    fonts
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
        .forEach(css => {
            styles.sheet.insertRule(css);
        });
};

const getWebfonts = (families: Webfont[]): void => {
    const msgId = send('get-webfonts', families);
    // keep on sending until we get something back
    window.addEventListener('message', function onM(evt) {
        if (!(evt instanceof MessageEvent)) {
            return;
        }

        const { id, error, result } = JSON.parse(evt.data);
        if (id !== msgId) {
            return;
        }

        window.removeEventListener('message', onM);

        if (error) {
            throw new Error(error);
        }

        installWebfonts(result);
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
    getWebfonts([
        { family: 'Guardian Text Egyptian Web', weight: 'bold' },
        { family: 'Guardian Text Egyptian Web', weight: 'regular' },
    ]);
});
