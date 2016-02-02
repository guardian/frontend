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
        widget: '.js-plista',
        container: '.js-plista-container'
    };

    function loadInstantly() {
        return !document.getElementById('dfp-ad--merchandising-high') ||
            detect.adblockInUse();
    }

    function identityPolicy() {
        return !(identity.isUserLoggedIn() && config.page.commentable);
    }

    function shouldServe() {
        return commercialFeatures.outbrain &&
                config.switches.plistaForOutbrainAu &&
                config.page.edition == 'AU' &&
                !config.page.isFront &&
                !config.page.isPreview &&
                identityPolicy();
    }

    // a modification of the code provided by Plista; altered to be a lazy load rather than during DOM construction
    function embed(publickey, widgetName, geo, u, categories) {
        var name = 'PLISTA_' + publickey;
        var lib = window[name];
        var $container = $(selectors.container);
        var $plista = $(selectors.widget);

        $container.append('<div data-display="plista_widget_' + widgetName + '"></div>');
        $container.css('display', 'block');
        $plista.append(plistaTpl);

        if (!lib || !lib.publickey) {
            window[name] = {
                publickey: publickey,
                widgets: [{name: widgetName, pre: u}],
                geo: geo,
                categories: categories,
                dataMode: 'data-display'
            };
            require(['js!' + (document.location.protocol === 'https:' ? 'https:' : 'http:') + '//static-au.plista.com/async/' + name + '.js']);
        } else {
            lib.widgets.push({name: widgetName, pre: u});
        }
    }

    function load() {
        fastdom.write(function () {
            embed('462925f4f131001fd974bebe', 'innerArticle', 'au');
        });
    }

    function init() {
        if (shouldServe()) {
            if (loadInstantly()) {
                module.load();
            } else {
                mediator.on('modules:commercial:dfp:rendered', function (event) {
                    if (event.slot.getSlotId().getDomId() === 'dfp-ad--merchandising-high' && event.isEmpty) {
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
