define([
    'bonzo',
    'picturefill',
    'lodash/collections/forEach',
    'lodash/functions/debounce',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/mediator'
],
function (
    bonzo,
    picturefill,
    forEach,
    debounce,
    $,
    $css,
    mediator
) {

    var images = {

        upgradePictures: function () {
            var images = [].slice.call($('img[srcset]', document.body));
            picturefill({ elements: images });
        },

        listen: function () {
            mediator.addListeners({
                'ui:images:upgradePictures': function () {
                    images.upgradePictures();
                }
            });
        }

    };

    return images;

});
