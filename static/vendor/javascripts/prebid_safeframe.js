

// this script can be returned by an ad server delivering a cross domain iframe, into which the
// creative will be rendered, e.g. DFP delivering a SafeFrame

// It is strongly inspired by Prebid.js/integrationExamples/gpt/x-domain/creative.js

// Use this in combination with a creative modelled on:
// https://www.google.com/dfp/59666047#delivery/PreviewCreative/orderId=2259406532&lineItemId=4615205472&creativeId=138228201638
//

var guardian_pb_safeframe = {
    "adServerDomain": function(){
        return window.location.protocol + '//tpc.googlesyndication.com';
    },
    "renderAd": function(ev) {
        var key = ev.message ? 'message' : 'data';
        var adObject = {};
        try {
            adObject = JSON.parse(ev[key]);
        } catch (e) {
            return;
        }

        if ( ! ( adObject.ad || adObject.adUrl ) ) {
            return;
        }

        var doc = window.document;
        var ad = adObject.ad;
        var url = adObject.adUrl;
        var width = adObject.width;
        var height = adObject.height;

        if (adObject.mediaType === 'video') {
            console.log('Error trying to write ad. mediaType "video" is not supported in adObject = ', adObject);
            return;
        }

        if (ad) {
            doc.write(ad);
            doc.close();
            return;
        }
        if (url) {
            doc.write('<IFRAME SRC="' + url + '" FRAMEBORDER="0" SCROLLING="no" MARGINHEIGHT="0" MARGINWIDTH="0" TOPMARGIN="0" LEFTMARGIN="0" ALLOWTRANSPARENCY="true" WIDTH="' + width + '" HEIGHT="' + height + '"></IFRAME>');
            doc.close();
            return;
        }
    },

    "requestAdFromPrebid": function( adId, publisherDomainURL ) {
        var message = JSON.stringify({
            message: 'Prebid Request',
            adId: adId,
            adServerDomain: this.adServerDomain()
        });
        window.parent.postMessage(message, publisherDomainURL);
    },

    "listenAdFromPrebid": function(){
        window.addEventListener('message', this.renderAd, false);
    },

    "loadAdFromPrebid": function( adId, publisherDomainURL ) {
        this.listenAdFromPrebid();
        this.requestAdFromPrebid( adId, publisherDomainURL );
    }
};
