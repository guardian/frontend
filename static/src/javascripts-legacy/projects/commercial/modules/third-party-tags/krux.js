define([
    'lib/config',
    'lib/cookies',
    'lib/storage'
], function (
    config,
    cookies,
    storage
) {
    var kruxUrl = '//cdn.krxd.net/controltag?confid=JVZiE3vn';

    function retrieve(n) {
        var k = 'kx' + n;

        return storage.local.getRaw(k) || cookies.get(k + '=([^;]*)') || '';
    }

    function getSegments() {
        return retrieve('segs') ? retrieve('segs').split(',') : [];
    }

    return {
        shouldRun: !(config.page.contentType == 'Network Front') && config.switches.krux,
        url: kruxUrl,
        getSegments: getSegments
    };

});
