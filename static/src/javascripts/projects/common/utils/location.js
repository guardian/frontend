define(function () {
    /**
     * Mockable proxy for window.location
     */

    return {
        getHash : function getHash() {
            return window.location.hash;
        }
    };
});
