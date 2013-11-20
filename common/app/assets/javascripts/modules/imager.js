define(['$', 'utils/to-array', 'bonzo', 'utils/mediator', 'imager', 'utils/detect', 'lodash/objects/clone'], function ($, toArray, bonzo, mediator, imagerjs, detect, clone) {

    var imager = {

        upgrade: function(context) {
            context = context || document;
            var breakpoint = detect.getBreakpoint(),
                optionDefaults = {
                    availableWidths: [ 140, 220, 300, 460, 620, 700 ],
                    strategy: 'container',
                    replacementDelay: 0,
                    placeholder: {
                        matchingClassName: 'item__image'
                    }
                };

            toArray(context.getElementsByClassName('item__image-container')).forEach(function(container) {
                var $container = bonzo(container),
                    forceUpdgradeBreakpoints = ($container.attr('data-force-upgrade') || '').split(' ');
                if (($('html').hasClass('connection--low') && forceUpdgradeBreakpoints.indexOf(breakpoint) === -1) || $container.css('display') === 'none') {
                    return;
                }
                // clear out container
                $container.html('');
                var options = clone(optionDefaults, true),
                    classes = $container.attr('data-img-class');
                // add any defined classes
                if (classes) {
                    options.placeholder.matchingClassName += ' ' + classes;
                }
                imagerjs.init([container], options);
            });
        },

        listen: function() {
            mediator.addListeners({
                'window:resize': function(e) {
                    imager.upgrade();
                },
                'window:orientationchange': function(e) {
                    imager.upgrade();
                }
            });
        }

    };

    return imager;

});
