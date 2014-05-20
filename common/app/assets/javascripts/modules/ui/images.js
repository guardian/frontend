define([
    'common/$',
    'bonzo',
    'common/utils/mediator',
    'imager'
],
function (
    $,
    bonzo,
    mediator,
    imager
) {

    var images = {

        upgrade: function(context) {
            context = context || document;
            var options = {
                    availableWidths: [ 140, 220, 300, 460, 620, 700, 940, 1430, 1920 ],
                    strategy: 'container',
                    replacementDelay: 0
                },
                containers = $('.js-image-upgrade', context).map(
                    function(container) {
                        return container;
                    },
                    // this is an optional filter function
                    function(container) {
                        return bonzo(container).css('display') !== 'none';
                    }
                );
            imager.init(containers, options);
            // add empty alts if none exist
            containers.forEach(function(container) {
                $('img', container).each(function(img) {
                    var $img = bonzo(img);
                    if ($img.attr('alt') === null) {
                        $img.attr('alt', '');
                    }
                });
            });
        },

        listen: function() {
            mediator.addListeners({
                'window:resize': function() {
                    images.upgrade();
                },
                'window:orientationchange': function() {
                    images.upgrade();
                },
                'ui:images:upgrade': function() {
                    images.upgrade();
                }
            });
        }

    };

    return images;

});
