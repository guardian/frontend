define([
    'common/utils/config',
    'common/modules/ui/sticky',
    'common/utils/fastdom-promise',
    'lodash/objects/defaults'
], function (
    config,
    Sticky,
    fastdom,
    defaults) {

    var mpuHeight = 275,
        StickyMpu = function ($adSlot, options) {
            this.$adSlot = $adSlot;
            this.opts    = defaults(options || {}, {
                top: 0
            });
        };

    StickyMpu.prototype.create = function () {
        var offset;

        if (this.$adSlot.data('name') !== 'right') {
            return;
        }

        offset = fastdom.read(config.page.hasShowcaseMainElement ? function () {
            return document.querySelector('.media-primary').offsetHeight;
        } : function () {
            var body = document.querySelector('.content__article-body')
            if (body) {
                return body.offsetTop;
            } else {
                throw new Error("There is no element to stick the element to");
            }
        });

        offset.then(function (articleBodyOffset) {
            this.$adSlot.parent().css('height', (articleBodyOffset + mpuHeight) + 'px');
            new Sticky(this.$adSlot[0], { top: this.opts.top }).init();
        }.bind(this)).catch(function () {
            // Liveblogs don't need sticky MPUs and we fail silently
        });
    };

    return StickyMpu;

});
