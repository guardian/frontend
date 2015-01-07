define([
    'qwery',
    'common/modules/ui/sticky'
], function (
    qwery,
    Sticky
) {

    var StickyMpu = function ($adSlot) {
        this.$adSlot = $adSlot;
    };

    StickyMpu.prototype.create = function () {
        var articleBodyOffset = qwery('.content__article-body')[0].offsetTop,
            $mpuContainer     = this.$adSlot.parent().css('height', (articleBodyOffset + 275) + 'px');

        new Sticky(this.$adSlot[0], { top: 12 }).init();
    };

    return StickyMpu;

});
