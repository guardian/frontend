define(['$', 'utils/to-array', 'bonzo', 'utils/mediator', 'imager'], function ($, toArray, bonzo, mediator, imagerjs) {

    var imager = {

        upgrade: function(context) {
            if ($('html').hasClass('connection--low')) {
                return;
            }
            context = context || document;
            var images = toArray(document.getElementsByClassName('item__image-container')).filter(function(img) {
                    return bonzo(img).css('display') !== 'none';
                }),
                options = {
                    availableWidths: [ 140, 220, 300, 460, 620, 700 ],
                    strategy: 'container',
                    replacementDelay: 0
                };
            imagerjs.init(images, options);
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
