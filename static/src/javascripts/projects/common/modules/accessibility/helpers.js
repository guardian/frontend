import fastdom from 'fastdom';
import { isOn } from 'common/modules/accessibility/main';

const shouldHideFlashingElements = (callback) => {
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
