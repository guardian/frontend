define(['$', 'utils/to-array', 'bonzo', 'utils/mediator', 'imager', 'utils/detect'], function ($, toArray, bonzo, mediator, imager, detect) {

    var images = {

        upgrade: function(context) {
            context = context || document;
            var breakpoint = detect.getBreakpoint(),
                options = {
                    availableWidths: [ 140, 220, 300, 460, 620, 700 ],
                    strategy: 'container',
                    replacementDelay: 0
                };

            toArray(context.getElementsByClassName('item__image-container')).forEach(function(container) {
                var $container = bonzo(container),
                    forceUpgradeAttr = $container.attr('data-force-upgrade'),
                    forceUpdgradeBreakpoints = forceUpgradeAttr !== null ? forceUpgradeAttr.split(' ') : [],
                    isForceUpgrade = forceUpdgradeBreakpoints.indexOf(breakpoint) !== -1 || forceUpgradeAttr === '';
                if (($('html').hasClass('connection--low') && !isForceUpgrade) || $container.css('display') === 'none') {
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
                }
            });
        }

    };

    return images;

});
