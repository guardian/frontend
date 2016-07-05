define([
    'common/utils/config'
], function (
    config
) {

    function load() {
        return require(['js!' + '//secure-au.imrworldwide.com/v60.js'], function () {
            var pvar = { cid: 'au-guardian', content: '0', server: 'secure-au' };
            // nol_t is a global function set by the imrworldwide library
            /*eslint-disable no-undef*/
            var trac = nol_t(pvar);
            trac.record().post();
        });
    }

    return {
        shouldRun: config.switches.imrWorldwide,
        load: load
    };

});
