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
        nthParagraph: 7,
        wordCountThreshold: 200,
        inlineAdTemplate: '<div class="ad-slot ad-slot--inline" data-base="%slot%" data-median="%slot%"><div class="ad-container"></div></div>',
        mpuAdTemplate: '<div class="ad-slot ad-slot--mpu-banner-ad" data-link-name="ad slot mpu-banner-ad" data-base="%slot%" data-median="%slot%"><div class="ad-container"></div></div>'
    };

    // inserts a few inline advert slots in to the page
    ArticleBodyAdverts.prototype.createInlineAdSlots = function(id, adPlacedAtBeginning) {

        // Prevent any inline ads being showed on short articles
        if(this.config.wordCount && this.config.wordCount < this.config.wordCountThreshold) {
            return false;
        }

        var adsPlaced         = 0,
            paragraphSelector = 'p:nth-of-type('+ this.config.nthParagraph +'n)',
            limit             = this.config.inlineAdLimit,
            template          = this.config.inlineAdTemplate,
            article           = document.getElementsByClassName('js-article__container')[0];

        // `adsPlaced` is the number of adverts currently placed inline. This is more accurate than
        // using the `i` from the each function as that can skip ads depending on content length
        if(adPlacedAtBeginning) {
            adsPlaced++;
            limit++;
        }

        $(paragraphSelector, article).each(function(el, i) {
            var $el = $(el),
                cls = (adsPlaced % 2 === 0) ? '' : 'is-even';

            /*
             - Checks if limit is set and if so, checks it hasn't been exceeded
             - Checks is the $target element exists. If not, then you are at the end of the article
             - Checks if the text length is below 120 characters - helps prevent against empty paragraphs
               and paragraphs being used instead of order/unordered lists
             */
            if(limit !== null && limit < (adsPlaced + 1) || $el.next()[0] === undefined || $el.text().length < 120) {
                return false;
            }

            bonzo(bonzo.create(template.replace(/%slot%/g, id))).addClass(cls).insertBefore($el);

            adsPlaced++;
        });
    };

    ArticleBodyAdverts.prototype.createMpuAdSlot = function(id) {
        var template = this.config.mpuAdTemplate;

        $('.js-mpu-ad-slot .social-wrapper').after(bonzo.create(template.replace(/%slot%/g, id))[0]);
    };

    ArticleBodyAdverts.prototype.createAdSlotAtTopOfArticle = function(id) {
        var template = this.config.inlineAdTemplate;

        var el = bonzo(bonzo.create(template.replace(/%slot%/g, id)));
        el.prependTo($('.js-article__container .article-body p')[0]);
    };

    ArticleBodyAdverts.prototype.destroy = function() {
        $('.ad-slot--inline, .ad-slot--mpu-banner-ad').remove();
    };

    ArticleBodyAdverts.prototype.reload = function() {
        this.destroy();
        this.init();
    };

    ArticleBodyAdverts.prototype.init = function() {
        var breakpoint = detect.getBreakpoint();

        if((/wide|desktop/).test(breakpoint)) {
            this.createInlineAdSlots('Middle1');
            this.createMpuAdSlot('Middle');
        }

        if((/tablet/).test(breakpoint)) {
            this.createAdSlotAtTopOfArticle('Middle');
            this.createInlineAdSlots('Middle1', true);
        }

        if((/mobile/).test(breakpoint)) {
            this.createInlineAdSlots('x49');
        }
    };

    return ArticleBodyAdverts;

});
