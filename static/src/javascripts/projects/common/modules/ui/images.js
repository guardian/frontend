define([
    'bonzo',
    'picturefill',
    'lodash/modern/collections/forEach',
    'lodash/modern/functions/debounce',
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
                },
                'ui:images:lazyLoaded': function (context) {
                    picturefill({
                        elements: [context]
                    });
                }
            });
        }

    };

    return images;

});
