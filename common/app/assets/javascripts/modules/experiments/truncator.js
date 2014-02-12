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
        template: '<button class="truncation-cta truncation-cta--continue js-continue-reading" data-link-name="continue reading">Continue reading</button>' +
            '<a href="/" class="truncation-cta truncation-cta--back-home" data-link-name="back to home">' +
            '<i class="i i-back-double"></i> Back to home<a/>'
    };

    Truncator.prototype.getParagraphs = function() {
        return toArray(qwery('p', this.config.contentEl));
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
        var contentChildren = toArray(this.config.contentEl.children);
        return contentChildren.slice(contentChildren.indexOf(this.el) + 1, contentChildren.length);
    };

    Truncator.prototype.toggleContent = function() {
        this.getContentAfterEl().forEach(function(el){
            bonzo(el).toggleClass(this.classes.hidden);
        }, this);
    };

    Truncator.prototype.showCta = function() {
        bonzo(qwery('.' + this.classes.actions)).prepend(this.config.template);
        bean.on(qwery('.' + this.classes.btn)[0], 'click', this.toggleContent.bind(this));
        bean.on(qwery('.' + this.classes.btn)[0], 'click', this.hideCta.bind(this));
    };

    Truncator.prototype.hideCta = function() {
        qwery('.' + this.classes.btn)[0].remove();
    };

    Truncator.prototype.truncate = function() {
        this.showCta();
        this.toggleContent();
    };

    return Truncator;

});