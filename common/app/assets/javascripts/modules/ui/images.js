define(['common/$', 'common/utils/to-array', 'bonzo', 'common/utils/mediator', 'imager', 'common/utils/detect'], function ($, toArray, bonzo, mediator, imager, detect) {

    var images = {

        upgrade: function(context) {
            context = context || document;
            var breakpoint = detect.getBreakpoint(),
                options = {
                    availableWidths: [ 140, 220, 300, 460, 620, 700, 940 ],
                    strategy: 'container',
                    replacementDelay: 0
                };

            toArray(context.getElementsByClassName('js-image-upgrade')).forEach(function(container) {
                var $container = bonzo(container);
                if ($container.css('display') === 'none') {
                    return;
                }
                imager.init([container], options);
            });
        },

        listen: function() {
            mediator.addListeners({
                'window:resize': function(e) {
                    images.upgrade();
                },
                'window:orientationchange': function(e) {
                    images.upgrade();
                },
                'ui:images:upgrade': function(e) {
                    images.upgrade();
                }
            });
        }

    };

    return images;

});
