/*global Imager:true */
define([
    '$',
    'utils/to-array',
    'bonzo',
    'utils/mediator'
], function (
    $,
    toArray,
    bonzo,
    mediator
) {

    var imager = {

        upgrade: function(context, callback) {
            if ($('html').hasClass('connection--low')) {
                return;
            }
            require(['imager'], function(imager) {
                context = context || document;
                var images = toArray(document.getElementsByClassName('item__image-container')).filter(function(img) {
                        return bonzo(img).css('display') !== 'none';
                    }),
                    options = {
                        availableWidths: [ 140, 220, 300, 460, 620, 700 ],
                        strategy: 'container',
                        replacementDelay: 0
                    };
                imager.init(images, options);
                if (callback) {
                    callback(images);
                }
            });
        },

        listen: function() {
            mediator.addListeners({
                'window:resize': imager.upgrade,
                'window:orientationchange': imager.upgrade
            });
        }

    };

    return imager;

});
