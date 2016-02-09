define(function () {
    function addTrackingPixel($adSlot, url) {
        $adSlot.before('<img src="' + encodeURI(url) + '" class="creative__tracking-pixel">');
    }

    return addTrackingPixel;
});
