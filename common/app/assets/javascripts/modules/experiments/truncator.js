define([
    'lodash/objects/assign',
    'lodash/collections/toArray',
    'lodash/collections/find',
    'qwery',
    'bonzo'
], function(
    extend,
    toArray,
    find,
    qwery,
    bonzo
) {

    var Truncator = function(config) {
        this.config = extend(this.config, config);
        this.init();
    };

    Truncator.prototype.config = {
        contentEl: qwery('.js-article__container'),
        percentageCap: 40
    };

    Truncator.prototype.getParagraphs = function() {
        return toArray(qwery('p', this.config.contentEl));
    };

    Truncator.prototype.getWordCount = function(el) {
        return el.innerHTML.split(/\s+/).length;
    };

    Truncator.prototype.findParagraphAtPercentage = function(paras) {
        var count = 0;
        return find(paras, function(el) {
            count += this.getWordCount(el);
            return count > parseInt(this.config.wordCount/100*this.config.percentageCap, 10);
        }, this);
    };

    Truncator.prototype.truncate = function(el) {
        bonzo(el).addClass('truncate');
    };

    Truncator.prototype.init = function() {
        this.truncate(this.findParagraphAtPercentage(this.getParagraphs()));
    };

    return Truncator;

});