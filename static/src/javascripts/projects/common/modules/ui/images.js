define([
    'bonzo',
    'imager',
    'lodash/collections/forEach',
    'lodash/functions/debounce',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/mediator'
],
function (
    bonzo,
    imager,
    forEach,
    debounce,
    $,
    $css,
    mediator
) {

    var images = {
        // these should match the widths in _vars.scss
        availableWidths: [140, 220, 300, 460, 620, 700, 860, 940, 1430, 1920],

        upgrade: function (context) {
            context = context || document;
            var options = {
                    availableWidths: images.availableWidths,
                    strategy: 'container',
                    replacementDelay: 0
                },
                containers = $('.js-image-upgrade', context).map(
                    function (container) {
                        return container;
                    },
                    // this is an optional filter function
                    function (container) {
                        return $css(bonzo(container), 'display') !== 'none';
                    }
                );
            imager.init(containers, options);
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
