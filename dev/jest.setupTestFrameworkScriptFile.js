// Polyfill test environment (done by polyfill.io in production)
require('core-js');

// Stub global Guardian config
window.guardian = {
    config: {
        switches: {},
        page: {},
        images: {
            commercial: {},
        },
        libs: {},
    },
    css: {},
    adBlockers: {
        active: undefined,
        onDetect: [],
    },
};

// Stub matchmedia
window.matchMedia =
    window.matchMedia ||
    function() {
        return {
            matches: false,
            addListener() {},
            removeListener() {},
        };
    };
