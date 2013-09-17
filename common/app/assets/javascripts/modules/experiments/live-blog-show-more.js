define([
    'common',
    'bonzo',
    'bean'
], function (
    common,
    bonzo,
    bean
) {

    function LiveBlogShowMore(options) {
        this.options = common.extend(this.DEFAULTS, options);
        this.blocks = common.toArray(this.options.context.getElementsByClassName(this.options.cls));
        this.btn = this.options.context.getElementsByClassName(this.options.btnCls)[0];
        if(this.blocks.length > 1) {
            this.init();
        }
    }

    LiveBlogShowMore.prototype.DEFAULTS = {
        cls: 'js-live-blog-blocks',
        btnCls: 'js-live-blog-show-more',
        hiddenCls: 'live-blog__blocks--hidden',
        context: document
    };

    LiveBlogShowMore.prototype.init = function() {
        var self = this;
        this.blocks.forEach(function(el, i) {
            if(i !== 0) { bonzo(el).addClass('live-blog__blocks--hidden'); }
        });
        bean.on(this.btn, 'click', function() {
            bonzo(self.options.context.querySelector('.' + self.options.hiddenCls)).removeClass(self.options.hiddenCls);
            if (!self.blocks.some(function(el) { return bonzo(el).hasClass(self.options.hiddenCls); })) {
                bonzo(self.btn).addClass('h');
            }
        });
        bonzo(this.btn).removeClass('h');
    };

    return LiveBlogShowMore;

});
