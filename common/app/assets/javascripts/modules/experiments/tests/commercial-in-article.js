/*global guardian */
define([
    'common',
    'qwery',
    'bonzo',
    'bean',
    'utils/detect',
    'modules/analytics/adverts',
    'modules/adverts/sticky'
], function (
    common,
    qwery,
    bonzo,
    bean,
    detect,
    Sticky
) {

    var inlineAdvertSlot = '<div class="ad-slot ad-slot--inline"><div class="ad-container"></div></div>',
        supportsSticky = detect.hasCSSSupport('position', 'sticky'),
        supportsFixed  = detect.hasCSSSupport('position', 'fixed', true);

    // inserts a few inline advert slots in to the page 
    var createInlineAdSlots = function () {
        var article = document.getElementsByClassName('js-article__container')[0];
        bonzo(qwery('p:nth-of-type(10n)'), article).each(function(el, i) {
            var cls = (i % 2 === 0) ? 'is-odd' : 'is-even';
            bonzo(bonzo.create(inlineAdvertSlot)).addClass(cls).insertAfter(this);
        });
    };
    
    // inserts a few inline advert slots in to the page 
    var createAdhesiveAdSlots = function () {
        if(!supportsSticky && supportsFixed) {
            var s = new Sticky({
                elCls: 'ad-slot--top-banner-ad',
                id: 'Top2'
            });
        }
    };

    var CommercialInArticle = function () {

        var self = this;
        
        this.id = 'CommercialInArticle';
        this.expiry = '2014-01-07';
        this.audience = 0.1;
        this.audienceOffset = 0;
        this.description = 'Inserts commercial components in to the articles to monitor CTR';
        this.canRun = function(config) {
            //console.log(detect.getBreakpoint(), supportsSticky, supportsFixed, config.page.contentType);
            if(   config.page.contentType === 'Article'
               && (/mobile|tablet/).test(detect.getBreakpoint())
               && supportsSticky
               && supportsFixed
              ) {
                return true;
            } else {
                return false;
            }
        };
        this.variants = [
            {
                id: 'adhesive-commercial',
                test: function(context, config) {
                    
                    // Commercial components served into adhesive position
                    // Advertising served into in-article position
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha1.com';
                    
                    createInlineAdSlots();
                    createAdhesiveAdSlots();
                }
            },
            {
                id: 'inline-commercial',
                test: function(context, config, isBoth) {
                    
                    // Commercial components served into in-article position,
                    // Advertising served into adhesive position and; 
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha2.com';
                    
                    createInlineAdSlots();
                    createAdhesiveAdSlots();
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

    return CommercialInArticle;

});
