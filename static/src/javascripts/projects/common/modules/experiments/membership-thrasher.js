define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/membership-thrasher.html'
], function (
    bean,
    fastdom,
    $,
    config,
    template,
    svgs,
    membershipThrasherTemplate) {
    var MembershipThrasher = function (options) {
        var opts = options || {};
        this.$container = opts.$container;
        this.name = opts.name;
        this.description = opts.description;
        this.linkHref = opts.linkHref;

        this.thrasherTmpl = template(membershipThrasherTemplate, {
            propositionName: this.name,
            propositionDescription: this.description,
            linkHref: this.linkHref
        });
    };

    MembershipThrasher.prototype.show = function () {
        fastdom.write(function () {
            this.$container.after(this.thrasherTmpl);
        }.bind(this));
    };

    return MembershipThrasher;
});
