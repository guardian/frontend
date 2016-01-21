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
        if (this.$adSlot.data('name') !== 'right') {
            return;
        }

        var element = document.querySelector(config.page.hasShowcaseMainElement ? '.media-primary' : '.content__article-body');
        if (!element) {
            return;
        }

        return fastdom.read(function () {
            return element[config.page.hasShowcaseMainElement ? 'offsetHeight' : 'offsetTop'];
        }).then(function (articleBodyOffset) {
            return fastdom.write(function () {
                this.$adSlot.parent().css('height', (articleBodyOffset + mpuHeight) + 'px');
                return new Sticky(this.$adSlot[0], { top: this.opts.top }).init();
            }, this);
        }.bind(this));
    };

    return StickyMpu;

});
