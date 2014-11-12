define([
    'modules/vars',
    'utils/url-host'
], function(
    vars,
    urlHost
) {
    return function (url) {
        return urlHost(url) === vars.CONST.mainDomain;
    };
});
