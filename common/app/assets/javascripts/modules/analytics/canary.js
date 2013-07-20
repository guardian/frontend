/*global Event:true */
define(['common'], function (common) {

    // Canaries were once regularly used in coal mining as an early warning system. Toxic gases
    // such as carbon monoxide, methane or carbon dioxide in the mine would kill the bird
    // before affecting the miners. Signs of distress from the bird indicated to the miners that
    // conditions were unsafe.

    // Our canary logs feature interactions to help quickly find broken features..
    
    var Canary = function (config) {

        var c = config || {},
            isDev = (c.isDev !== undefined) ? c.isDev : false,
            url = "//beacon." + window.location.hostname,
            path = '/px.gif',
            cons = c.console || window.console,
            body = document.body,
            createImage = function(url) {
                var image = new Image();
                image.id = 'js-canary';
                image.className = 'h';
                image.src = url;
                body.appendChild(image);
            },
            makeUrl = function(feature) {
                return url + path + '?' + 'canary/' + feature ;
            },
            log = function(feature) {
                var url = makeUrl(feature);
                createImage(url);
            },
            init = function() {
                // navigation
                common.mediator.on('module:clickstream:click', function (clickSpec) {
                    if (clickSpec.toLowerCase().indexOf('global navigation: header | sections') > -1) {
                        log('navigation');
                    }
                });
            };

        return {
            log: log,
            init: init
        };

    };

    return Canary;
});
