define([
    'common/utils/$',
    'common/utils/template',
    'text!common/views/commercial/gustyle/label.html'
], function (
    $,
    template,
    labelTpl
) {
	var Gustyle = function ($slot, adtype) {
		this.$slot = $slot;
		this.adtype = adtype;
	};

	Gustyle.prototype.addLabel = function () {
		this.$slot.prepend($.create(template(labelTpl, {})));
	};
    
    return Gustyle;
});