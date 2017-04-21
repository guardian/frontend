define([
    'Promise',
    'fastdom',
    'lib/$',
    'lib/config',
    'lib/detect',
    'lodash/utilities/template',
    'commercial/modules/dfp/track-ad-render',
    'commercial/modules/commercial-features',
    'raw-loader!commercial/views/plista.html',
    'lib/load-script'
], function (
    Promise,
    fastdom,
    $,
    config,
    detect,
    template,
    trackAdRender,
    commercialFeatures,
    plistaStr,
    loadScript
) {

    var plistaTpl = template(plistaStr);
    var selectors = {
        container: '.js-plista-container'
    };

    function loadInstantly() {
        return detect.adblockInUse.then(function(adblockInUse){
            return !document.getElementById('dfp-ad--merchandising-high') || adblockInUse;
        });
    }

    // a modification of the code provided by Plista; altered to be a lazy load rather than during DOM construction
    function embed(publickey, widgetName, geo, u, categories) {
        var name = 'PLISTA_' + publickey;
        var lib = window[name];
        var $container = $(selectors.container);

        $container.append(plistaTpl({widgetName: widgetName}));
        $container.css('display', 'block');

        if (!lib || !lib.publickey) {
            window[name] = {
                publickey: publickey,
                widgets: [{name: widgetName, pre: u}],
                geo: geo,
                categories: categories,
                dataMode: 'data-display'
            };
            loadScript.loadScript('//static-au.plista.com/async/' + name + '.js');
        } else {
            lib.widgets.push({name: widgetName, pre: u});
        }
    }

    function load() {
        fastdom.write(function () {
            embed(config.page.plistaPublicApiKey, 'innerArticle', 'au');
        });
    }

    var module = {
        load: load,
        init: init
    };

    function init() {
        if (commercialFeatures.outbrain) {
            return loadInstantly().then(function(adBlockInUse){
                if (adBlockInUse) {
                    module.load();
                } else {
                    return trackAdRender('dfp-ad--merchandising-high').then(function (isLoaded){
                        if (!isLoaded) {
                            module.load();
                        }
                    });
                }
            });
        }else {
            return Promise.resolve(false);
        }
    }

    return module;
});
