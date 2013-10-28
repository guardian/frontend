define(['common', 'bonzo'], function (common, bonzo) {

    return {

        upgrade: function(context) {
            if (common.$g('html').hasClass('connection--low')) {
                return;
            }
            require(['js!imager'], function() {
                context = context || document;
                var images = common.toArray(document.getElementsByClassName('item__image-container')).filter(function(img) {
                        return bonzo(img).css('display') !== 'none';
                    }),
                    options = {
                        availableWidths: [ 140, 220, 300, 460, 620, 700 ],
                        strategy: 'container',
                        replacementDelay: 0
                    };
                Imager.init(images, options);
            });
        }

    };

});
