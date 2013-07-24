/*global Event:true */
define(['common'], function (common) {

    // Canaries were once regularly used in coal mining as an early warning system. Toxic gases
    // such as carbon monoxide, methane or carbon dioxide in the mine would kill the bird
    // before affecting the miners. Signs of distress from the bird indicated to the miners that
    // conditions were unsafe.

    // Our canary logs feature interactions (clickstream) to help quickly find broken features.
    
    var Canary = function (config) {

        var c = config || {},
            isDev = (c.isDev !== undefined) ? c.isDev : false,
            url = "//beacon." + window.location.hostname,
            sample = c.sample || 0.01, // only sample 1:100 requests (we are interested in % of drop, not absolute numbers)
            path = '/px.gif',
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
            evaluateClick = function(clickSpec) {
                // https://github.com/guardian/frontend/pull/1237#issuecomment-21261022
                [
                    {
                        linkname: 'global navigation: header | sections',
                        feature: 'navigation'
                    }
                ].forEach(function(spec) {
                    if (clickSpec.toLowerCase().indexOf(spec.linkname) > -1) {
                        log(spec.feature);
                    }
                });
            },
            init = function() {
               
                if (Math.random() > sample) {
                    return false;
                }
                
                common.mediator.on('module:clickstream:click', function (clickSpec) {
                    evaluateClick(clickSpec);
                });

            };

        return {
            log: log,
            init: init
        };

    };

    return Canary;
});
