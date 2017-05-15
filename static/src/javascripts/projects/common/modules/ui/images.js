import qwery from 'qwery';
import picturefill from 'picturefill';
import mediator from 'lib/mediator';

var images = {

    upgradePictures: function(context) {
        picturefill({
            elements: qwery('img[srcset], picture img', context || document)
        });
    },

    listen: function() {
        mediator.addListeners({
            'ui:images:upgradePictures': images.upgradePictures
        });
    }

};

export default images;
