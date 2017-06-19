import fastdom from 'fastdom';
import accessibility from 'common/modules/accessibility/main';
import $ from 'lib/$';

function shouldHideFlashingElements(callback) {
    if (!accessibility.isOn('flashing-elements')) {
        fastdom.write(function() {
            $('body').addClass('disable-flashing-elements');
            if (callback) {
                callback();
            }
        });
    } else if (callback) {
        callback();
    }
}

export default {
    shouldHideFlashingElements: shouldHideFlashingElements
};
