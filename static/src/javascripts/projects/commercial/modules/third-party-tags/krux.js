import config from 'lib/config';
import cookies from 'lib/cookies';
import storage from 'lib/storage';
var kruxUrl = '//cdn.krxd.net/controltag?confid=JVZiE3vn';

function retrieve(n) {
    var k = 'kx' + n;

    return storage.local.getRaw(k) || cookies.getCookie(k + '=([^;]*)') || '';
}

function getSegments() {
    return retrieve('segs') ? retrieve('segs').split(',') : [];
}

export default {
    shouldRun: config.switches.krux,
    url: kruxUrl,
    getSegments: getSegments
};
