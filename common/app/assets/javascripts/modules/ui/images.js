define(['$', 'utils/to-array', 'bonzo', 'utils/mediator', 'imager', 'utils/detect', 'lodash/objects/clone'], function ($, toArray, bonzo, mediator, imager, detect, clone) {

    var images = {

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
                    forceUpgradeAttr = $container.attr('data-force-upgrade'),
                    forceUpdgradeBreakpoints = forceUpgradeAttr !== null ? forceUpgradeAttr.split(' ') : [],
                    isForceUpgrade = forceUpdgradeBreakpoints.indexOf(breakpoint) !== -1 || forceUpgradeAttr === '';
                if (($('html').hasClass('connection--low') && !isForceUpgrade) || $container.css('display') === 'none') {
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
