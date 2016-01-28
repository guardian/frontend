define([
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'common/modules/identity/api',
    'text!common/views/commercial/plista.html'
], function (
    fastdom,
    $,
    config,
    template,
    identity,
    plistaTpl) {

    var containerOuterClassName = 'js-plista';
    var containerInnerClassName = 'js-plista-container';

    // a modification of the code provided by Plista; altered to be a lazy load rather than during DOM construction
    function embed(publickey, widgetName, geo, u, categories, containerTag) {
        var name = 'PLISTA_' + publickey;
        var lib = window[name];
        var container = document.getElementsByClassName(containerTag)[0];

        container.innerHTML = '<div data-display="plista_widget_' + widgetName + '"></div>';

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

    return {
        load: function () {
            var $containerOuter = $('.' + containerOuterClassName);
            var $containerInner = $('.' + containerInnerClassName);

            fastdom.write(function () {
                $containerOuter.css('display', 'block');
                $containerInner.append($.create(template(plistaTpl)));

                embed('462925f4f131001fd974bebe', 'innerArticle', 'au', undefined, undefined, containerInnerClassName);
            });
        }
    };
});
