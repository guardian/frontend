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
        this.el = this.findParagraphAtPercentage(this.getParagraphs());
        this.truncate();
    };

    Truncator.prototype.classes =  {
        el: 'js-truncate',
        btn: 'js-continue-reading',
        hidden: 'u-h'
    };

    Truncator.prototype.config = {
        contentEl: qwery('.js-article__body')[0],
        percentageCap: 40,
        template: '<button class="continue-reading js-continue-reading">continue reading</button>'
    };

    Truncator.prototype.getParagraphs = function() {
        return toArray(qwery('p', this.config.contentEl));
    };

    Truncator.prototype.getWordCount = function(el) {
        return el.innerHTML.split(/\s+/).length;
    };

    Truncator.prototype.getPercentage = function() {
        return parseInt(this.config.wordCount/100*this.config.percentageCap, 10);
    };

    Truncator.prototype.findParagraphAtPercentage = function(paras) {
        var count = 0;
        return find(paras, function(el) {
            count += this.getWordCount(el);
            return count > this.getPercentage();
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
        bonzo(this.el).append(this.config.template);
    };

    Truncator.prototype.hideCta = function() {
        qwery('.' + this.classes.btn)[0].remove();
    };

    Truncator.prototype.bindListeners = function() {
        bean.on(this.el, 'click', '.' + this.classes.btn, this.toggleContent.bind(this));
        bean.on(this.el, 'click', '.' + this.classes.btn, this.hideCta.bind(this));
    };

    Truncator.prototype.truncate = function() {
        this.showCta();
        this.bindListeners();
        this.toggleContent();
    };

    return Truncator;

});