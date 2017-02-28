define(function () {

    return addTrackingPixel;

    function addTrackingPixel(url) {
        new Image().src = url;
    }

});
