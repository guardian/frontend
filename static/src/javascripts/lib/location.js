/**
 * Mockable proxy for window.location
 */

export default {
    getHash: function getHash() {
        return window.location.hash;
    }
};
