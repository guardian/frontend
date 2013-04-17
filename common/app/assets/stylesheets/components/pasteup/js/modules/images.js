/*
    Module: detect/images.js
    Description: Updates image src attributes based on connection speed.
*/
/*jshint strict: false */

define(['./detect'], function (detect) {

    function upgrade() {
        if (detect.getConnectionSpeed() !== 'low') {
            var images = document.querySelectorAll('img[data-fullsrc]'); // Leave old browsers.
            for (var i = 0, j = images.length; i<j; ++i) {
                var image = images[i];
                var width = image.getAttribute('data-width');
                var fullsrc = image.getAttribute('data-fullsrc');
                if (width && width <= image.offsetWidth && fullsrc ) {
                    image.src = fullsrc;
                    image.className += ' image-high';
                }
            }
        }
    }

    return {
        'upgrade': upgrade
    };

});