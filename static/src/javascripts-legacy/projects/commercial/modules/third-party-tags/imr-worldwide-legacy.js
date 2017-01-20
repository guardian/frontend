define([
    'common/utils/config',
    'common/modules/experiments/ab'
], function (
    config,
    ab
) {
    // The Nielsen NetRatings tag. Also known as IMR worldwide.

    var imrWorldwideUrl = '//secure-au.imrworldwide.com/v60.js';

    function onLoad() {
        var correctServer = ab.getTestVariantId("NeilsenCheck") === "opt-in" ? 'secure-gl' : 'secure-au';

        var pvar = { cid: 'au-guardian', content: '0', server: correctServer };
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
