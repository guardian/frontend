define([
    'Promise',
    'common/utils/$'
], function (
    Promise,
    $
) {
    function hexToRGB(hex) {
        var R = parseInt(hex.substring(0,2),16);
        var G = parseInt(hex.substring(2,4),16);
        var B = parseInt(hex.substring(4,6),16);

        return R + ', ' + G + ', ' + B;
    }

    function removeHash(colour) {
        return (colour.charAt(0)=='#') ? colour.substring(1,7) : colour;
    }

    function init() {
        return new Promise(function(resolve) {
            var $nextVideo = $('.js-next-video');
            var colour = removeHash($nextVideo.data('colour'));

            $nextVideo.css({
                'background': 'rgba(' + hexToRGB(colour) + ', 0.1)'
            });

            resolve();
        });
    }

    return {
        init: init
    };
});
