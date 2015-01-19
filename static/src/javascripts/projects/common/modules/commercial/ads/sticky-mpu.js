define([
    'qwery',
    'lodash/objects/defaults',
    'common/modules/ui/sticky'
], function (
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
        articleBodyOffset = qwery('.content__article-body')[0].offsetTop;
        this.$adSlot.parent().css('height', (articleBodyOffset + mpuHeight) + 'px');
        new Sticky(this.$adSlot[0], { top: this.opts.top }).init();
    };

    return StickyMpu;

});
