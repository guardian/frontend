/*global guardian */
define([
    'common',
    'qwery',
    'bonzo',
    'bean',
    'utils/detect'
], function (
    common,
    qwery,
    bonzo,
    bean,
    detect
) {

    var inlineAdvertSlot = '<div class="ad-slot ad-slot--inline" data-base="%slot%" data-median="%slot%"><div class="ad-container"></div></div>',
        topSlot = 'TODO';

    // inserts a few inline advert slots in to the page 
    var createInlineAdSlots = function (id) {
        var article = document.getElementsByClassName('js-article__container')[0];
        bonzo(qwery('p:nth-of-type(10n)'), article).each(function(el, i) {
            var cls = (i % 2 === 0) ? 'is-odd' : 'is-even';
            bonzo(bonzo.create(inlineAdvertSlot.replace(/%slot%/g, id))).addClass(cls).insertAfter(this);
        });
    };
    
    var createTopAdSlot = function (id) {
        // TODO 
    };

    var CommercialInArticlesMobile = function () {

        var self = this;
        
        this.id = 'CommercialInArticlesMobile';
        this.expiry = '2014-01-07';
        this.audience = 0.1;
        this.audienceOffset = 0.6;
        this.description = 'Inserts commercial components in to the articles to monitor CTR';
        this.canRun = function(config) {
            return (config.page.contentType === 'Article'
                && (/mobile/).test(detect.getBreakpoint())
            );
        };
        this.variants = [
            {
                id: 'CommercialInline',
                test: function(context, config) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha1.com';
                    createInlineAdSlots('Top');
                    createTopAdSlot('x49');
                }
            },
            {
                id: 'CommercialTop',
                test: function(context, config) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha1.com';
                    createInlineAdSlots('x49');
                    createTopAdSlot('Top');
                }
            },
            {
                id: 'control',
                test: function(context, config) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha.com';
                }
            }
        ];
    };

    return CommercialInArticlesMobile;

});
