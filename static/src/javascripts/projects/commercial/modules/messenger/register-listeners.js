// @flow
import { register } from 'commercial/modules/messenger';

import { setType } from 'commercial/modules/messenger/type';
import { getStyles } from 'commercial/modules/messenger/get-stylesheet';
import { resize } from 'commercial/modules/messenger/resize';
import { onMessage as onMessageScroll } from 'commercial/modules/messenger/scroll';
import { onMessage as onMessageViewport } from 'commercial/modules/messenger/viewport';
import { sendClick } from 'commercial/modules/messenger/click';
import { setBackground } from 'commercial/modules/messenger/background';

const registerListeners = (): void => {
    register('type', (specs: ?string, ret, iframe) =>
        setType(specs, iframe && iframe.closest('.js-ad-slot'))
    );

    register('get-styles', (specs): ?Array<any> => {
        if (specs) {
            return getStyles(specs, document.styleSheets);
        }
    });

    register('resize', (specs, ret, iframe) => {
        if (iframe && specs) {
            const adSlot = iframe && iframe.closest('.js-ad-slot');
            return resize(specs, iframe, adSlot);
        }
    });

    register('scroll', onMessageScroll, {
        persist: true,
    });

    register('viewport', onMessageViewport, {
        persist: true,
    });

    register('click', (linkName, ret, iframe = {}) =>
        sendClick(
            iframe.closest('.js-ad-slot') || {
                id: 'unknown',
            },
            linkName || ''
        )
    );

    register('background', (specs, ret, iframe): ?Promise<any> => {
        if (iframe && specs) {
            return setBackground(specs, iframe.closest('.js-ad-slot'));
        }
    });
};

export { registerListeners };
