/* jshint -W024 */
define([
    'knockout'
], function (ko) {
    function register () {
        ko.components.loaders.unshift({
            loadTemplate: function (name, templateConfig, callback) {
                if (typeof templateConfig !== 'object' || !('text' in templateConfig)) {
                    callback(null);
                    return;
                }

                System.import(templateConfig.text + '!text').then(function (text) {
                    callback(ko.utils.parseHtmlFragment(text));
                });
            },
            loadViewModel: function (name, templateConfig, callback) {
                if (typeof templateConfig !== 'object' || !('jspm' in templateConfig)) {
                    callback(null);
                    return;
                }

                System.import('./' + templateConfig.jspm).then(function (Component) {
                    callback(function (params, componentInfo) {
                        return new Component(params, componentInfo.element);
                    });
                });
            }
        });
        ko.components.register('fronts-widget', {
            viewModel: { jspm: 'widgets/fronts' },
            template: { text: 'widgets/fronts.html' }
        });
        ko.components.register('latest-widget', {
            viewModel: { jspm: 'widgets/latest' },
            template: { text: 'widgets/latest.html' }
        });
        ko.components.register('search-controls', {
            viewModel: {
                createViewModel: function (params) {
                    return params.context.$data;
                }
            },
            template: { text: 'widgets/search_controls.html' }
        });
        ko.components.register('collection-widget', {
            viewModel: {
                createViewModel: function (params) {
                    return params.context.$data;
                }
            },
            template: { text: 'widgets/collection.html' }
        });
        ko.components.register('clipboard-widget', {
            viewModel: { jspm: 'widgets/clipboard' },
            template: { text: 'widgets/clipboard.html' }
        });
        ko.bindingHandlers.ownerClass = {
            init: function (element, valueAccessor) {
                var owner = valueAccessor();
                if (owner.registerElement) {
                    owner.registerElement(element);
                }
            }
        };
    }

    return {
        register: register
    };
});
