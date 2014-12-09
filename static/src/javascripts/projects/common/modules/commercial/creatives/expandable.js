define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/commercial/creatives/expandable.html'
], function (
    bean,
    bonzo,
    $,
    mediator,
    storage,
    template,
    expandableTpl
) {

    /**
     * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10028247
     */
    var Expandable = function ($adSlot, params) {
        this.$adSlot      = $adSlot;
        this.params       = params;
        this.isClosed     = true;
        this.closedHeight = Math.min(bonzo.viewport().height / 3, 300);
        this.openedHeight = Math.min(bonzo.viewport().height * 2 / 3, 600);
    };

    Expandable.prototype.listener = function () {
        if ((window.pageYOffset + bonzo.viewport().height) > (this.$ad.offset().top + this.openedHeight)) {
            // expires in 1 week
            var week = 1000 * 60 * 60 * 24 * 7;

            // TODO - needs to have a creative-specific id
            storage.local.set('gu.commercial.expandable.an-expandable', true, { expires: Date.now() + week });
            this.$button.toggleClass('button-spin');
            this.$ad.css('height', this.openedHeight);
            this.isClosed = false;

            return true;
        }
    };

    Expandable.prototype.create = function () {
        var $expandable = $.create(template(expandableTpl, this.params));

        this.$ad     = $('.ad-exp--expand', $expandable).css('height', this.closedHeight);
        this.$button = $('.ad-exp__close-button', $expandable);

        $('.ad-exp-collapse__slide', $expandable).css('height', this.closedHeight);

        if (this.params.trackingPixel) {
            this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
        }

        $expandable.appendTo(this.$adSlot);

        if (!storage.local.get('gu.commercial.expandable.an-expandable')) {
            mediator.on('window:scroll', this.listener.bind(this));
        }

        bean.on(this.$button[0], 'click', function () {
            this.$button.toggleClass('button-spin');
            this.$ad.css('height', this.isClosed ? this.openedHeight : this.closedHeight);
            this.isClosed = !this.isClosed;
        }.bind(this));

    };

    return Expandable;

});
