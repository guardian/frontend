import { isOn } from 'common/modules/accessibility/main';
import fastdom from 'fastdom';

const shouldHideFlashingElements = (
    callback: () => {} | null | undefined
): void => {
    if (!isOn('flashing-elements')) {
        fastdom.mutate(() => {
            if (document.body) {
                document.body.classList.add('disable-flashing-elements');
            }

            if (callback) {
                callback();
            }
        });
    } else if (callback) {
        callback();
    }
};

export { shouldHideFlashingElements };
