define([
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/storage'
], function (
    config,
    cookies,
    storage
) {
    function load() {
        if (config.switches.krux) {
            return require(['js!' + '//cdn.krxd.net/controltag?confid=JVZiE3vn']);
        }
    }

    function retrieve(n) {
        var k = 'kx' + n;

        return storage.local.getRaw(k) || cookies.get(k + '=([^;]*)') || '';
    }

    function getSegments() {
        return retrieve('segs') ? retrieve('segs').split(',') : [];
    }

    return {
        load: load,
        getSegments: getSegments
    };

});
