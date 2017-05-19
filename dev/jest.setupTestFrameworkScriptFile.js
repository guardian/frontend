require('babel-polyfill');

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
