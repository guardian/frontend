define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/commercial/creatives/expandable.html'
], function (
    bean,
    bonzo,
    fastdom,
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
        var that = this,
            week = 1000 * 60 * 60 * 24 * 7;

        fastdom.read(function () {
            if ((window.pageYOffset + bonzo.viewport().height) > (that.$ad.offset().top + that.openedHeight)) {
                // TODO - needs to have a creative-specific id
                storage.local.set('gu.commercial.expandable.an-expandable', true, { expires: Date.now() + week });

                fastdom.write(function () {
                    that.$button.toggleClass('button-spin');
                    that.$ad.css('height', that.openedHeight);
                });

                that.isClosed = false;
                return true;
            }
        });
    };

    Expandable.prototype.create = function () {
        var $expandable = $.create(template(expandableTpl, this.params)),
            that = this;

        this.$ad     = $('.ad-exp--expand', $expandable);
        this.$button = $('.ad-exp__close-button', $expandable);

        fastdom.write(function () {
            that.$ad.css('height', that.closedHeight);
            $('.ad-exp-collapse__slide', $expandable).css('height', that.closedHeight);

            if (that.params.trackingPixel) {
                that.$adSlot.before(
                    '<img src="' + that.params.trackingPixel + that.params.cacheBuster +
                        '" class="creative__tracking-pixel" height="1px" width="1px"/>'
                );
            }

            $expandable.appendTo(this.$adSlot);
        });

        if (!storage.local.get('gu.commercial.expandable.an-expandable')) {
            mediator.on('window:scroll', this.listener.bind(this));
        }

        bean.on(this.$button[0], 'click', function () {
            fastdom.write(function () {
                that.$button.toggleClass('button-spin');
                that.$ad.css('height', that.isClosed ? that.openedHeight : that.closedHeight);
                that.isClosed = !that.isClosed;
            });
        });
    };

    return Expandable;
});
