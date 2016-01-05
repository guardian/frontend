define([
    'common/utils/config'
], function (
    config
) {

    function load() {
        if (config.switches.imrWorldwide) {
            return require(['js!' + '//secure-au.imrworldwide.com/v60.js'], function () {
                var pvar = { cid: "au-guardian", content: "0", server: "secure-au" };
                var trac = nol_t(pvar);
                trac.record().post();
            });
        }
    }

    return {
        load: load
    };

});
