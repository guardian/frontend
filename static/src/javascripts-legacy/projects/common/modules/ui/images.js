define([
    'qwery',
    'picturefill',
    'lib/mediator'
],
function (
    qwery,
    picturefill,
    mediator
) {

    var images = {

        upgradePictures: function (context) {
            picturefill({ elements: qwery('img[srcset], picture img', context || document) });
        },

        listen: function () {
            mediator.addListeners({
                'ui:images:upgradePictures':  images.upgradePictures
            });
        }

    };

    return images;

});
