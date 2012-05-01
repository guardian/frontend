/*
    Module: detect/images.js
    Description: Updates image src attributes based on connection speed.
*/
/*jshint strict: false */

define(['./detect'], function (detect) {

    function upgrade() {
        if (detect.getConnectionSpeed() !== 'low') {
            var images = document.querySelectorAll('img[data-hisrc]'); // Leave old browsers.
            for (var i = 0, j = images.length; i<j; ++i) {
                var image = images[i];
                var width = image.getAttribute('data-width');
                if (width && width <= image.offsetWidth ) {
                    images[i].src = images[i].getAttribute('data-hisrc');
                    images[i].className += ' image-high';
                }
            }
        }
    }

    return {
        'upgrade': upgrade
    };

});