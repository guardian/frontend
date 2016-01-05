define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'ldsh!common/views/commercial/creatives/expandable.html',
    'lodash/functions/bindAll'
], function (
    bean,
    bonzo,
    fastdom,
    $,
    mediator,
    storage,
    expandableTpl,
    bindAll) {

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
        var $expandable = $.create(expandableTpl({ data: this.params }));

        this.$ad     = $('.ad-exp--expand', $expandable);
        this.$button = $('.ad-exp__close-button', $expandable);

        fastdom.write(function () {
            this.$ad.css('height', this.closedHeight);
            $('.ad-exp-collapse__slide', $expandable).css('height', this.closedHeight);
            if (this.params.trackingPixel) {
                this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
            }
            $expandable.appendTo(this.$adSlot);
        }.bind(this));

        if (!storage.local.get('gu.commercial.expandable.an-expandable')) {
            mediator.on('window:throttledScroll', this.listener);
        }

        bean.on(this.$button[0], 'click', function () {
            this.$button.toggleClass('button-spin');
            this.$ad.css('height', this.isClosed ? this.openedHeight : this.closedHeight);
            this.isClosed = !this.isClosed;
        }.bind(this));

    };

    return Expandable;

});
