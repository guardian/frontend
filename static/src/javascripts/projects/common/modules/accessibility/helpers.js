// @flow
import fastdom from 'fastdom';
import accessibility from 'common/modules/accessibility/main';

const shouldHideFlashingElements = (callback: ?() => {}): void => {
    if (!accessibility.isOn('flashing-elements')) {
        fastdom.write(() => {
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
