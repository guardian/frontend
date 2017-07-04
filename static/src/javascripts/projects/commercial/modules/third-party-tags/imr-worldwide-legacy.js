define([
    'lib/config'
], function (
    config
) {
    // The Nielsen NetRatings tag. Also known as IMR worldwide.

    var imrWorldwideUrl = '//secure-au.imrworldwide.com/v60.js';

    function onLoad() {
        var pvar = { cid: 'au-guardian', content: '0', server: 'secure-gl' };
        // nol_t is a global function set by the imrworldwide library
        /*eslint-disable no-undef*/
        var trac = nol_t(pvar);
        trac.record().post();
    }

    return {
        shouldRun: config.switches.imrWorldwide,
        url: imrWorldwideUrl,
        onLoad: onLoad
    };

});
