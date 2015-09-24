define([
    'bonzo',
    'picturefill',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/mediator'
],
function (
    bonzo,
    picturefill,
    $,
    $css,
    mediator
) {

    var images = {

        upgradePictures: function (context) {
            var images = [].slice.call($('img[srcset]', context || document.body));
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
