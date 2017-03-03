define([
    'lib/config'
], function (config) {

    function getUrl(location) {
        var ta_partner = 'partner:guardian-uk';
        var ta_account = config.page.isDev ? 'tuata-dev-internal' : 'tuatourism-australia-global';
        var ta_pageName = ta_partner + ':' + location.pathname;
        var ta_server = location.hostname;
        var ta_url = location.href;
        var ta_cachebreak = new Date().getTime();

        return '//tourismaustralia.sc.omtrdc.net/b/ss/' + ta_account +
            '/1/H.26.2/s' + ta_cachebreak +
            '?AQB=1&ndh=0&ns=tourismaustralia&pageName=' + encodeURIComponent(ta_pageName) +
            '&g= ' + encodeURIComponent(ta_url) +
            '&server=' + encodeURIComponent(ta_server) +
            '&v11=' + encodeURIComponent(ta_partner) +
            '&AQE=1';
    }

    return {
        shouldRun: config.page.section === 'ashes-australia-travel' && config.switches.tourismAustralia,
        url: getUrl(window.location),
        useImage: true
    };

});
