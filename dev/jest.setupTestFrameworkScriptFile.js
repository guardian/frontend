// Polyfill test environment (done by polyfill.io in production)
require('core-js');

jest.mock('../static/src/javascripts/projects/commercial/sentinel', () => {
    amIUsed: jest.fn();
});

// Stub global Guardian config
// eslint-disable-next-line id-denylist -- this is on purpose
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
