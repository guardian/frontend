/*global guardian */
define([
    'qwery',
    'bonzo',
    'modules/detect',
    'modules/analytics/adverts',
    'modules/adverts/sticky'
], function (qwery, bonzo, detect, inview, Sticky) {

    var AlphaAdverts = function () {

        var self = this,
            nParagraphs = '10',
            alphaOasUrl = 'www.theguardian-alpha.com',
            inlineTmp = '<div class="ad-slot ad-slot--inline"><div class="ad-container"></div></div>',
            mpuTemp = '<div class="ad-slot ad-slot--mpu-banner-ad" data-link-name="ad slot mpu-banner-ad" data-median="Middle" data-extended="Middle"><div class="ad-container"></div></div>';

        this.id = 'AlphaAdverts';
        this.expiry = '2013-11-30';
        this.audience = 1;
        this.description = 'Test new advert formats for alpha release';
        this.canRun = function(config) {
            if(config.page.contentType === 'Article') {
                guardian.config.oasSiteIdHost = alphaOasUrl;
                return true;
            } else {
                return false;
            }
        };
        this.variants = [
            {
                id: 'Inline', //Article A
                test: function() {
                    var article = document.getElementsByClassName('js-article__container')[0];
                    bonzo(qwery('p:nth-of-type('+ nParagraphs +'n)'), article).each(function(el, i) {
                        var cls = (i % 2 === 0) ? 'is-odd' : 'is-even';
                        bonzo(bonzo.create(inlineTmp)).attr({
                            'data-inview-name' : 'Every '+ nParagraphs +'th para',
                            'data-inview-advert' : 'true',
                            'data-base' : 'Bottom3',
                            'data-median' : 'Middle',
                            'data-extended' : 'Middle'
                        }).addClass(cls).insertAfter(this);
                    });
                    inview(document);
                    return true;
                }
            },
            {
                id: 'Adhesive', //Article B
                test: function() {
                    var viewport = detect.getLayoutMode(),
                        s;
                    if(viewport === 'mobile' || viewport === 'tablet' && detect.getOrientation() === 'portrait'){
                        document.getElementsByClassName('ad-slot--top-banner-ad')[0].setAttribute('data-inview-name', 'Top adhesive');
                        document.getElementsByClassName('parts__head')[0].className += ' is-sticky';
                        s = new Sticky({
                            elCls: 'ad-slot--top-banner-ad',
                            id: 'Top2'
                        });
                    } else {
                        document.getElementsByClassName('js-mpu-ad-slot')[0].appendChild(bonzo.create(mpuTemp)[0]);
                        s = new Sticky({
                            elCls: 'js-mpu-ad-slot',
                            id: 'mpu-ad-slot'
                        });
                    }
                    inview(document);
                    return true;
                }
            },
            {
                id: 'Both',  //Article C
                test: function() {
                    document.body.className += ' test-inline-adverts--on';
                    self.variants.forEach(function(variant){
                        if(variant.id === 'Inline' || variant.id === 'Adhesive') {
                            variant.test.call(self);
                        }
                    });
                    return true;
                }
            },
            {
                id: 'control', //Article D
                test: function() {
                    return true;
                }
            }
        ];
    };

    return AlphaAdverts;

});
