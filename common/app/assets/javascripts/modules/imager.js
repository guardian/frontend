define(['$', 'utils/to-array', 'bonzo', 'utils/mediator', 'imager', 'modules/detect'], function ($, toArray, bonzo, mediator, imagerjs, detect) {

    var imager = {

        upgrade: function(context) {
            context = context || document;
            var breakpoint = detect.getBreakpoint();
            var images = toArray(document.getElementsByClassName('item__image-container')).filter(function(img) {
                    var forceUpdgradeBreakpoints = (bonzo(img).attr('data-force-upgrade') || '').split(' ');
                    if ($('html').hasClass('connection--low') && forceUpdgradeBreakpoints.indexOf(breakpoint) === -1) {
                        return;
                    }
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
