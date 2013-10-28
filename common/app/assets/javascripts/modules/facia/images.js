define(['common', 'bonzo'], function (common, bonzo) {

    return {

        upgrade: function(context) {
            if (common.$g('html').hasClass('connection--low')) {
                return;
            }
            require(['js!imager'], function() {
                context = context || 'body';
                var images = common.toArray(document.querySelectorAll('.item__image-container'), context).filter(function(img) {
                        return bonzo(img).css('display') !== 'none';
                    }),
                    options = {
                        availableWidths: [ 140, 220, 300, 460, 620, 700 ],
                        strategy: 'container',
                        replacementDelay: 200
                    };
                Imager.init(images, options);
            });
        }

    };

});
