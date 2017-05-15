// @flow
import qwery from 'qwery';
import picturefill from 'picturefill';
import mediator from 'lib/mediator';

const images = {
    upgradePictures(context) {
        picturefill({
            elements: qwery('img[srcset], picture img', context || document),
        });
    },

    listen() {
        mediator.addListeners({
            'ui:images:upgradePictures': images.upgradePictures,
        });
    },
};

export default images;
