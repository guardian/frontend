define([
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/identity/api',
    'common/modules/commercial/commercial-features',
    'text!common/views/commercial/plista.html'
], function (
    fastdom,
    $,
    config,
    detect,
    mediator,
    template,
    identity,
    commercialFeatures,
    plistaStr
) {

    var plistaTpl = template(plistaStr);
    var selectors = {
        container: '.js-plista-container'
    };

    function loadInstantly() {
        return !document.getElementById('dfp-ad--merchandising-high') ||
            detect.adblockInUseSync();
    }

    function identityPolicy() {
        return !(identity.isUserLoggedIn() && config.page.commentable);
    }

    function shouldServe() {
        return commercialFeatures.outbrain &&
                !config.page.isFront &&
                !config.page.isPreview &&
                config.page.section !== 'childrens-books-site' &&
                identityPolicy();
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
            require(['js!//static-au.plista.com/async/' + name + '.js']);
        } else {
            lib.widgets.push({name: widgetName, pre: u});
        }
    }

    function load() {
        fastdom.write(function () {
            embed(config.page.plistaPublicApiKey, 'innerArticle', 'au');
        });
    }

    function init() {
        if (shouldServe()) {
            if (loadInstantly()) {
                module.load();
            } else {
                mediator.on('modules:commercial:dfp:rendered', function (event) {
                    if (event.slot.getSlotElementId() === 'dfp-ad--merchandising-high' && event.isEmpty) {
                        module.load();
                    }
                });
            }
        }
    }

    var module = {
        load: load,
        init: init
    };

    return module;
});
