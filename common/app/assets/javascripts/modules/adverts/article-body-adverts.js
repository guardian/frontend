/*global guardian */
define([
    'common/$',
    'common/common',
    'common/modules/component',
    'bonzo',
    'bean',
    'lodash/objects/assign',
    'common/utils/detect'
], function (
    $,
    common,
    Component,
    bonzo,
    bean,
    extend,
    detect
) {

    function ArticleBodyAdverts(config) {
        this.context = document;
        this.config = extend(this.config, config);
    }

    Component.define(ArticleBodyAdverts);

    ArticleBodyAdverts.prototype.config = {
        inlineAdLimit: null,
        wordsPerAd: 350,
        minWordsInParagraph: 120,
        inlineAdTemplate: '<div class="ad-slot ad-slot--inline" data-base="%slot%" data-median="%slot%"><div class="ad-container"></div></div>',
        mpuAdTemplate: '<div class="ad-slot ad-slot--mpu-banner-ad" data-link-name="ad slot mpu-banner-ad" data-base="%slot%" data-median="%slot%"><div class="ad-container"></div></div>'
    };

    ArticleBodyAdverts.prototype.inlineAdsPlaced = 0;

    /**
     * Function to create the inline ad slots on article pages.
     *
     * @param id               The id of the slot to render, i.e. 'Middle'
     * @param topSlotId        The id of the slot to be rendered at the top of the article. If no
     *                         id is provided, then the ad at the top isn't rendered.
     */
    ArticleBodyAdverts.prototype.createInlineAdSlots = function(id, topSlotId) {
        var wordsPerAd = this.config.wordsPerAd;

        // Prevents any inline ads being showed on short articles
        if(this.config.wordCount && this.config.wordCount < wordsPerAd) {
            return false;
        }

        var self                   = this,
            totalWords             = 0,
            adsPlaced              = 0,
            limit                  = this.config.inlineAdLimit,
            minWordsInParagraph    = this.config.minWordsInParagraph,
            topOfArticleWordsLimit = this.getTopOfArticleSlotWordLimit(),
            $paragraphs            = $('.js-article__container .article-body > p');

        $paragraphs.each(function(el, i) {
            var $el                    = $(el),
                words                  = $el.text().split(' '),
                renderTopOfArticleSlot = !!topSlotId && self.inlineAdsPlaced === 0;

            // Increment our running total of words
            totalWords += words.length;

            // Check to see if we should try to render an advert at the top of the article
            if(renderTopOfArticleSlot && totalWords > topOfArticleWordsLimit) {
                self.renderInlineAdSlot(topSlotId, $el);
                limit++;
            } else if(totalWords > ((self.inlineAdsPlaced + 1) * wordsPerAd)) {

                /*
                 - Checks if limit is set and if so, checks it hasn't been exceeded
                 - Checks is the $target element exists. If not, then you are at the end of the article
                 - Checks if the text length is below 120 characters - helps prevent against empty paragraphs
                   and paragraphs being used instead of order/unordered lists
                 */
                if(limit !== null && self.inlineAdsPlaced >= limit  || $el.next()[0] === undefined || $el.text().length < minWordsInParagraph) {
                    return false;
                }

                self.renderInlineAdSlot(id, $el);
            }

        });
    };

    ArticleBodyAdverts.prototype.renderInlineAdSlot = function(id, $el) {
        var template     = this.config.inlineAdTemplate,
            insertMethod = this.getInsertMethod();

        bonzo(bonzo.create(template.replace(/%slot%/g, id)))[insertMethod]($el);

        this.inlineAdsPlaced++;
    };

    ArticleBodyAdverts.prototype.createMpuAdSlot = function(id) {
        var template = this.config.mpuAdTemplate;

        $('.js-mpu-ad-slot .social-wrapper').after(bonzo.create(template.replace(/%slot%/g, id))[0]);
    };

    ArticleBodyAdverts.prototype.getInsertMethod = function() {
        return (/mobile/).test(detect.getBreakpoint()) ? 'insertAfter' : 'insertBefore';
    };

    ArticleBodyAdverts.prototype.getTopOfArticleSlotWordLimit = function() {
        return (/mobile/).test(detect.getBreakpoint()) ? Math.floor(this.config.wordsPerAd / 2) : 0;
    };

    ArticleBodyAdverts.prototype.destroy = function() {
        $('.ad-slot--inline, .ad-slot--mpu-banner-ad').remove();
        this.inlineAdsPlaced = 0;
    };

    ArticleBodyAdverts.prototype.reload = function() {
        this.destroy();
        this.init();
    };

    ArticleBodyAdverts.prototype.init = function() {
        var breakpoint = detect.getBreakpoint();

        // This is a dirty hack to be removed once the content API starts to generate the
        // word count from articles written in Composer. Was raised on 24/01/2014
        if(this.config.wordCount === '1') {
            this.config.wordCount = $('.js-article__container .article-body').text().replace(/(\r\n|\n|\r)/gm, '').split(' ').length;
        }

        if((/wide|desktop/).test(breakpoint)) {
            this.createInlineAdSlots('Middle1');
            this.createMpuAdSlot('Middle');
        }

        if((/tablet/).test(breakpoint)) {
            this.createInlineAdSlots('Middle1', 'Middle');
        }

        if((/mobile/).test(breakpoint)) {
            this.createInlineAdSlots('x49', 'x49');
        }
    };

    return ArticleBodyAdverts;

});
