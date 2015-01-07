define([
    'knockout'
], function (ko) {
    function register () {
        ko.components.register('fronts-widget', {
            viewModel: { require: 'widgets/fronts' },
            template: { require: 'text!widgets/fronts.html' }
        });
        ko.components.register('latest-widget', {
            viewModel: { require: 'widgets/latest' },
            template: { require: 'text!widgets/latest.html' }
        });
        ko.components.register('iframe-widget', {
            viewModel: { require: 'widgets/iframe' },
            template: { require: 'text!widgets/iframe.html' }
        });
        ko.components.register('search-controls', {
            viewModel: {
                createViewModel: function (params) {
                    return params.context.$data;
                }
            },
            template: { require: 'text!widgets/search_controls.html' }
        });
        ko.components.register('collection-widget', {
            viewModel: {
                createViewModel: function (params) {
                    return params.context.$data;
                }
            },
            template: { require: 'text!widgets/collection.html' }
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
