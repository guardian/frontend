define([
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/gustyle/label.html'
], function (
    fastdom,
    $,
    template,
    svgs,
    labelTpl
) {
    var Gustyle = function ($slot, adtype) {
        this.$slot = $slot;
        this.adtype = adtype;
    };

    Gustyle.prototype.addLabel = function () {
        fastdom.write(function () {
            this.$slot.addClass('gu-style');
            this.$slot.prepend($.create(template(labelTpl, {icon: svgs('arrowicon', ['gu-comlabel__icon'])})));
        }.bind(this));
    };
    return Gustyle;
});
