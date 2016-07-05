define([
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/storage'
], function (
    config,
    cookies,
    storage
) {
    var kruxUrl = '//cdn.krxd.net/controltag?confid=JVZiE3vn';

    function load() {
        return require(['js!' + kruxUrl]);
    }

    function retrieve(n) {
        var k = 'kx' + n;

        return storage.local.getRaw(k) || cookies.get(k + '=([^;]*)') || '';
    }

    function getSegments() {
        return retrieve('segs') ? retrieve('segs').split(',') : [];
    }

    return {
        shouldRun: config.switches.krux,
        url: kruxUrl,
        load: load,
        getSegments: getSegments
    };

});
