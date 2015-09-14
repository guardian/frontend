define([
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'common/modules/ui/toggles',
    'common/views/svgs',
    'text!common/views/commercial/gustyle/label.html'
], function (
    fastdom,
    $,
    template,
    Toggles,
    svgs,
    labelTpl
) {
    var Gustyle = function ($slot, adtype) {
        this.$slot = $slot;
        this.adtype = adtype;
    };

    Gustyle.prototype.addLabel = function () {
        var toggles;

        fastdom.write(function () {
            this.$slot.addClass('gu-style');
            this.$slot.prepend($.create(template(labelTpl, {icon: svgs('arrowicon', ['gu-comlabel__icon'])})));

            toggles = new Toggles(this.$slot[0]);
            toggles.init();
        }.bind(this));
    };
    return Gustyle;
});
