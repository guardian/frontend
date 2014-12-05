define([
    'bonzo',
    'imager',
    'lodash/collections/forEach',
    'lodash/functions/debounce',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/config',
    'common/utils/mediator'
],
function (
    bonzo,
    imager,
    forEach,
    debounce,
    $,
    $css,
    config,
    mediator
) {

    var images = {

        availableWidths: [140, 220, 300, 460, 620, 700, 860, 940, 1430, 1920],

        upgrade: function (context) {
            context = context || document;
            var options = {
                    availableWidths: images.availableWidths,
                    strategy: 'container',
                    replacementDelay: 0
                },
                optionsTemp = {
                    availableWidths: images.availableWidths,
                    strategy: 'container',
                    replacementDelay: 0,
                    placeholder: {
                        element: (function () {
                            var img = document.createElement('img');
                            img.style.display = 'none';
                            return img;
                        })(),
                        matchingClassName: 'resized-png-img'
                    }
                },
                containers = $('.js-image-upgrade', context).map(
                    function (container) {
                        return container;
                    },
                    // this is an optional filter function
                    function (container) {
                        return $css(bonzo(container), 'display') !== 'none';
                    }
                ),
                containersTemp = $('.js-image-upgrade', context).map(
                    function (container) {
                        return container;
                    },
                    // this is an optional filter function
                    function (container) {
                        return $css(bonzo(container), 'display') !== 'none' && container.getAttribute('data-src') && container.getAttribute('data-src').slice(-'.png'.length) === '.png';
                    }
                );
            imager.init(containers, options);
            // TODO temp code to put some load on the PNG resizer
            if (config.switches.pngResizing && Math.random() < 0.1) {
                imager.init(containersTemp, optionsTemp);
            }
            // END temp code
            // add empty alts if none exist
            forEach(containers, function (container) {
                $('img', container).each(function (img) {
                    var $img = bonzo(img);
                    if ($img.attr('alt') === null) {
                        $img.attr('alt', '');
                    }
                });
            });
        },

        listen: function () {
            mediator.addListeners({
                'window:resize': debounce(function () {
                    images.upgrade();
                }, 200),
                'window:orientationchange': debounce(function () {
                    images.upgrade();
                }, 200),
                'ui:images:upgrade': function (context) {
                    images.upgrade(context);
                }
            });
        }

    };

    return images;

});
