define([
    'knockout',
    'jquery'
], function (
    ko,
    $
) {
    ko.bindingHandlers.toggleClick = {
        init: function (element, valueAccessor) {
            var value = valueAccessor();

            ko.utils.registerEventHandler(element, 'click', function () {
                value(!value());
            });
        }
    };

    ko.bindingHandlers.slideVisible = {
        init: function (element, valueAccessor) {
            var value = valueAccessor();
            $(element).toggle(ko.unwrap(value));
        },
        update: function (element, valueAccessor) {
            var value = ko.unwrap(valueAccessor());
            value ? $(element).slideDown(200) : $(element).slideUp(200);
        }
    };

    ko.bindingHandlers.fadeVisible = {
        init: function(element, valueAccessor) {
            var value = valueAccessor();
            $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function(element, valueAccessor) {
            var value = valueAccessor();
            ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
        }
    };
});
