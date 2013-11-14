/*global Imager:true */
define(['$', 'utils/to-array', 'bonzo', 'utils/mediator'], function ($, toArray, bonzo, mediator) {

    var images = {

        upgrade: function(context, callback) {
            if ($('html').hasClass('connection--low')) {
                return;
            }
            require(['js!imager'], function() {
                context = context || document;
                var images = toArray(document.getElementsByClassName('item__image-container')).filter(function(img) {
                        return bonzo(img).css('display') !== 'none';
                    }),
                    options = {
                        availableWidths: [ 140, 220, 300, 460, 620, 700 ],
                        strategy: 'container',
                        replacementDelay: 0
                    };
                Imager.init(images, options);
                if (callback) {
                    callback(images);
                }
            });
        },

        listen: function() {
            mediator.addListeners({
                'window:resize': images.upgrade,
                'window:orientationchange': images.upgrade
            });
        }

    };

    return images;

});
