define([
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/detect',
    'common/utils/template',
    'common/modules/identity/api',
    'text!common/views/commercial/plista.html',
    'lodash/collections/contains'
], function (fastdom,
             $,
             config,
             mediator,
             detect,
             template,
             identity,
             plistaTpl,
             contains) {
    var containerOuterClassName = 'js-plista',
        containerInnerClassName = 'js-plista-container';

    return {
        load: function () {
            var $containerOuter = $('.' + containerOuterClassName),
                $containerInner = $('.' + containerInnerClassName);

            fastdom.write(function () {
                $containerOuter.css('display', 'block');
                $containerInner.append($.create(template(plistaTpl)));

                this.embed('462925f4f131001fd974bebe', 'innerArticle', 'au', undefined, undefined, containerInnerClassName);
            }.bind(this));
        },

        // a modification of the code provided by Plista; altered to be a lazy load rather than during DOM construction
        embed: function (p, w, g, u, c, containerTag) {
            var container = document.getElementsByClassName(containerTag)[0],
                name = 'PLISTA_' + p,
                lib = window[name];
            container.innerHTML = '<div data-display="plista_widget_' + w + '"></div>';
            if (!lib || !lib.publickey) {
                window[name] = {
                    publickey: p,
                    widgets: [{name: w, pre: u}],
                    geo: g,
                    categories: c,
                    dataMode: 'data-display'
                };
                require(['js!' + (document.location.protocol === 'https:' ? 'https:' : 'http:') + '//static-au.plista.com/async/' + name + '.js']);
            } else {
                lib.widgets.push({name: w, pre: u});
            }
        },

        getSection: function () {
            return config.page.section.toLowerCase().match('news')
            || contains(['politics', 'world', 'business', 'commentisfree'], config.page.section.toLowerCase()) ? 'sections' : 'all';
        },

        identityPolicy: function () {
            return (!identity.isUserLoggedIn() || !(identity.isUserLoggedIn() && config.page.commentable));
        },

        hasHighRelevanceComponent: function () {
            return detect.adblockInUse() || config.page.edition.toLowerCase() === 'int';
        },

        init: function () {
            if (
                !config.page.isFront
                && !config.page.isPreview
                && this.identityPolicy()
                && config.page.section !== 'childrens-books-site') {
                if (this.hasHighRelevanceComponent()) {
                    this.load();
                } else {
                    mediator.on('modules:commercial:dfp:rendered', function (event) {
                        if (event.slot.getSlotId().getDomId() === 'dfp-ad--merchandising-high' && event.isEmpty) {
                            this.load();
                        }
                    }.bind(this));
                }
            }
        }
    };
});
