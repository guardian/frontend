define([
    'bean',
    'bonzo',
    'common/utils/fastdom-promise',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'text!commercial/views/creatives/expandable.html',
    'lodash/functions/bindAll',
    'commercial/modules/creatives/add-tracking-pixel'
], function (
    bean,
    bonzo,
    fastdom,
    $,
    mediator,
    storage,
    template,
    expandableTpl,
    bindAll,
    addTrackingPixel
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

        bindAll(this, 'listener');
    };

    Expandable.prototype.listener = function () {
        var that = this;
        if ((window.pageYOffset + bonzo.viewport().height) > (this.$ad.offset().top + this.openedHeight)) {
            // expires in 1 week
            var week = 1000 * 60 * 60 * 24 * 7;

            // TODO - needs to have a creative-specific id
            storage.local.set('gu.commercial.expandable.an-expandable', true, { expires: Date.now() + week });

            fastdom.write(function () {
                that.$button.toggleClass('button-spin');
                that.$ad.css('height', that.openedHeight);
                that.isClosed = false;
            });

            return true;
        }
    };

    Expandable.prototype.create = function () {
        var $expandable = $.create(template(expandableTpl, { data: this.params }));

        this.$ad     = $('.ad-exp--expand', $expandable);
        this.$button = $('.ad-exp__close-button', $expandable);

        if (!storage.local.get('gu.commercial.expandable.an-expandable')) {
            mediator.on('window:throttledScroll', this.listener);
        }

        bean.on(this.$button[0], 'click', function () {
            this.$button.toggleClass('button-spin');
            this.$ad.css('height', this.isClosed ? this.openedHeight : this.closedHeight);
            this.isClosed = !this.isClosed;
        }.bind(this));


        return fastdom.write(function () {
            this.$ad.css('height', this.closedHeight);
            $('.ad-exp-collapse__slide', $expandable).css('height', this.closedHeight);
            if (this.params.trackingPixel) {
                addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
            }
            $expandable.appendTo(this.$adSlot);
            return true;
        }, this);
    };

    return Expandable;

});
