define([], function () {
    function init() {
        var meta = document.createElement('meta');
        meta.name = 'apple-itunes-app';
        meta.content = 'app-id=409128287, affiliate-data=myAffiliateData, app-argument=myURL';
        document.getElementsByTagName('head')[0].appendChild(meta);
    }

    return {
        init: init
    };
});
