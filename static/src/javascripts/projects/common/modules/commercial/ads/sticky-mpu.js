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
        var articleBodyOffset;

        if (this.$adSlot.data('name') !== 'right') {
            return;
        }
        fastdom.read(function () {
            articleBodyOffset = qwery('.content__article-body')[0].offsetTop;

            fastdom.write(function () {
                this.$adSlot.parent().css('height', (articleBodyOffset + mpuHeight) + 'px');
                new Sticky(this.$adSlot[0], { top: this.opts.top }).init();
            }.bind(this));
        }.bind(this));
    };

    return StickyMpu;
});
