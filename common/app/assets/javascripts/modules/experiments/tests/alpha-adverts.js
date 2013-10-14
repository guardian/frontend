/*global guardian */
define(['qwery', 'bonzo', 'modules/analytics/adverts'], function (qwery, bonzo, inview) {

    var AlphaAdverts = function () {

        var nParagraphs = '10',
            alphaOasUrl = 'www.theguardian-alpha.com',
            inlineTmp = '<div class="ad-slot ad-slot-inview"><div class="ad-container"></div></div>';

        // Label up ad slots
        var labelSlots = function() {
            bonzo(qwery('.ad-slot'), document).each(function() {
                this.setAttribute('data-inview-name', this.getAttribute('data-link-name'));
            });
        };

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
                    bonzo(qwery('p:nth-of-type('+ nParagraphs +'n)'), article).each(function() {
                        bonzo(bonzo.create(inlineTmp)).attr({
                            'data-inview-name' : 'every '+ nParagraphs +'th para',
                            'data-inview-advert' : 'true',
                            'data-base' : 'Bottom3',
                            'data-median' : 'Middle',
                            'data-extended' : 'Middle'
                        }).insertAfter(this);
                    });
                    inview(document);
                    return true;
                }
            },
            {
                id: 'Adhesive', //Article B
                test: function() {

                    return true;
                }
            },
            {
                id: 'Both',  //Article C
                test: function() {

                    return true;
                }
            },
            {
                id: 'control', //Article D
                test: function() {
                    guardian.config.switches.adverts = true;
                    return true;
                }
            }
        ];
    };

    return AlphaAdverts;

});
