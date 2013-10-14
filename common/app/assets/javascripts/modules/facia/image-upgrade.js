define(['common', 'bonzo', 'modules/detect'], function (common, bonzo, detect) {

    return function(item, isMain) {

        this.upgrade = function() {
            if (detect.getConnectionSpeed() !== 'low') {
                var $imageContainer = common.$g('.item__image-container', item);
                if ($imageContainer.length && $imageContainer.css('display') !== 'none') {
                    var $image = common.$g('.item__image', $imageContainer[0]),
                        srcDataAttr = isMain ? 'data-src-main' : 'data-src';
                    if (detect.getBreakpoint() === 'mobile') {
                        srcDataAttr += '-mobile';
                    }
                    $image.attr('src', $image.attr(srcDataAttr));
                    bonzo(item)
                        .addClass('item--image-upgraded')
                        .removeClass('item--no-image');
                }
            }
        };

    };

});
