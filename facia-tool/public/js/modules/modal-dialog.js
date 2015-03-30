define([
    'jquery',
    'knockout',
    'underscore'
], function (
    $,
    ko,
    _
) {
    function ModalDialog () {
        this.isOpen = ko.observable(false);

        this.templateName = ko.observable();
        this.templateData = ko.observable();
    }

    ModalDialog.prototype.confirm = function(config) {
        var deferred = new $.Deferred();

        var dialog = this;
        this.templateData(_.extend(config.data, {
            ok: function () {
                dialog.isOpen(false);
                deferred.resolve();
            },
            cancel: function () {
                dialog.isOpen(false);
                deferred.reject();
            }
        }));
        this.templateName(config.name);
        this.isOpen(true);

        return deferred.promise();
    };

    return new ModalDialog();
});
