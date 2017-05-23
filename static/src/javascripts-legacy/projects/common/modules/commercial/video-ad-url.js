define([
    'lib/config',
    'lib/url',
    'commercial/modules/build-page-targeting'
], function (
    config,
    urlUtils,
    buildPageTargeting
) {
    function getAdUrl () {
        var queryParams = {
            ad_rule: 1,
            correlator: new Date().getTime(),
            cust_params: encodeURIComponent(urlUtils.constructQuery(buildPageTargeting.buildPageTargeting())),
            env: 'vp',
            gdfp_req: 1,
            impl:'s',
            iu: config.page.adUnit,
            output: 'xml_vast2',
            scp: encodeURIComponent('slot=video'),
            sz: '400x300',
            unviewed_position_start: 1
        };

        return 'https://' + config.page.dfpHost + '/gampad/ads?' + urlUtils.constructQuery(queryParams);
    }

    return {
        get: getAdUrl
    };
});
