define(['common', 'bonzo', 'modules/detect'], function (common, bonzo, detect) {

    return function(imageContainer, isMain) {

        this.upgrade = function() {
            if (detect.getConnectionSpeed() !== 'low' && bonzo(imageContainer).css('display') !== 'none') {
                var $image = common.$g('.item__image', imageContainer),
                    src = $image.attr(isMain ? 'data-src-main' : 'data-src');
                    $image.attr('src', src);
            }
        };

    };

});
