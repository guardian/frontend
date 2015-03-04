define([
    'fastdom',
    'qwery',
    'lodash/objects/defaults',
    'common/modules/ui/sticky'
], function (
    fastdom,
    qwery,
    defaults,
    Sticky
) {
    var mpuHeight = 275,
        StickyMpu = function ($adSlot, options) {
            this.$adSlot = $adSlot;
            this.opts    = defaults(options || {}, {
                top: 0
            });
        };

    StickyMpu.prototype.create = function () {
        var articleBodyOffset,
            that = this;

        if (this.$adSlot.data('name') !== 'right') {
            return;
        }
        fastdom.read(function () {
            articleBodyOffset = qwery('.content__article-body')[0].offsetTop;

            fastdom.write(function () {
                that.$adSlot.parent().css('height', (articleBodyOffset + mpuHeight) + 'px');
                new Sticky(that.$adSlot[0], { top: that.opts.top }).init();
            });
        });
    };

    return StickyMpu;
});
