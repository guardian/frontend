define([
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/modules/ui/sticky',
    'lodash/objects/defaults'
], function (
    qwery,
    $,
    config,
    sticky,
    defaults) {

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
        articleBodyOffset = config.page.hasShowcaseMainElement ? $('.media-primary').dim().height : qwery('.content__article-body')[0].offsetTop;
        this.$adSlot.parent().css('height', (articleBodyOffset + mpuHeight) + 'px');
        sticky.stick(this.$adSlot[0], { top: this.opts.top });
    };

    return StickyMpu;

});
