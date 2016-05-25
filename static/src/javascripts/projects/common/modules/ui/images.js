define([
    'qwery',
    'picturefill'
    'common/utils/mediator'
],
function (
    qwery,
    picturefill,
    mediator
) {

    var images = {

        upgradePictures: function (context) {
            var images = qwery('img[srcset], picture img', context || document);
            picturefill({ elements: images });
        },

        listen: function () {
            mediator.addListeners({
                'ui:images:upgradePictures':  images.upgradePictures
            });
        }

    };

    return images;

});
