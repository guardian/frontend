/*global guardian */
define(['bonzo'], function (bonzo) {

    var AlphaAdverts = function () {

        this.id = 'AlphaAdverts';
        this.expiry = '2013-11-30';
        this.audience = 1;
        this.description = 'Test new advert formats for aplha release';
        this.canRun = function(config) {
            if(config.page.contentType === 'Article') {
                guardian.config.switches.adverts = false;
                return true;
            } else {
                return false;
            }
        };
        this.variants = [
            {
                id: 'Inline', //Article A
                test: function() {




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
            },
        ];
    };

    return AlphaAdverts;

});
