define([
    'lodash/objects/assign',
    'lodash/collections/toArray',
    'lodash/collections/find',

    'qwery',
    'bonzo',
    'bean'
], function(
    extend,
    toArray,
    find,

    qwery,
    bonzo,
    bean
) {

    var Truncator = function(config) {
        this.config = extend(this.config, config);
        this.el = this.findParagraphAtCap(this.getParagraphs());
        if(this.config.wordCount > this.config.minWordCount) {
            this.truncate();
        }
    };

    Truncator.prototype.classes =  {
        el: 'js-truncate',
        btn: 'js-continue-reading',
        actions: 'js-article-actions',
        hidden: 'u-h'
    };

    Truncator.prototype.config = {
        contentEl: qwery('.js-article__body')[0],
        wordCap: 500,
        minWordCount: 500,
        template: '<button class="truncation-cta truncation-cta--continue js-continue-reading" data-link-name="continue reading">' +
            '<i class="i i-arrow-down-double-blue"></i> Continue reading</button>' +
            '<a href="/" class="truncation-cta truncation-cta--back-home" data-link-name="back to home">' +
            '<span class="truncation-cta__icon"><span class="i i-home-white-mask"></span><span class="i i-home-white"></span></span>' +
            '<span class="truncation-cta__text"><span class="truncation-cta__short-label">Home</span><span class="truncation-cta__long-label">Back to homepage</span></span></a>'
    };

    Truncator.prototype.getParagraphs = function() {
        return toArray(qwery('.js-article__body > p'));
    };

    Truncator.prototype.getWordCount = function(el) {
        return el.innerHTML.split(/\s+/).length;
    };

    Truncator.prototype.findParagraphAtCap = function(paras) {
        var count = 0;
        return find(paras, function(el) {
            count += this.getWordCount(el);
            return count > this.config.wordCap;
        }, this);
    };

    Truncator.prototype.getContentAfterEl = function() {
        //Having to use '> *' instead of .children for x-browser compatibility
        var contentChildren = toArray(qwery('.js-article__body > *'));

        return contentChildren.slice(contentChildren.indexOf(this.el) + 1, contentChildren.length);
    };

    Truncator.prototype.addEllipsis = function(text) {
        return (/[^\w]$/g.test(text)) ?  text.slice(0, -1) + '…' : text + '…';
    };

    Truncator.prototype.removeEllipsis = function(text) {
       return (/…$/g.test(text)) ? text.slice(0, -1) + '.' : text;
    };

    Truncator.prototype.toggleContent = function() {
        this.getContentAfterEl().forEach(function(el){
            bonzo(el).toggleClass(this.classes.hidden);
        }, this);
    };

    Truncator.prototype.showCta = function() {
        this.el.innerHTML = this.addEllipsis(bonzo(this.el).text());
        bonzo(qwery('.' + this.classes.actions)).addClass('is-truncated').prepend(this.config.template);
        bean.on(qwery('.' + this.classes.btn)[0], 'click', this.toggleContent.bind(this));
        bean.on(qwery('.' + this.classes.btn)[0], 'click', this.hideCta.bind(this));
    };

    Truncator.prototype.hideCta = function() {
        this.el.innerHTML = this.removeEllipsis(bonzo(this.el).text());
        bonzo(qwery('.' + this.classes.btn)[0]).hide();
        bonzo(qwery('.' + this.classes.actions)).addClass('is-not-truncated');
    };

    Truncator.prototype.truncate = function() {
        this.showCta();
        this.toggleContent();
    };

    return Truncator;

});