var loadAds = function(){
    require([
        guardian.js.modules.writeCaptureNoLibSupport,
        guardian.js.modules.writeCapture,
        guardian.js.modules.detect],
            function(wcs, wc, detect) {

                function renderSlot(slot) {
                    var placeHolder = document.querySelector(slot.position);
                    if (placeHolder) {
                        writeCapture.html(slot.position, '<script' + '>OAS_RICH("' + slot.name + '")</scr' + 'ipt>');
                        placeHolder.className = ''
                    }
                }

                var keywordsString='';
                var keywords = guardian.page.keywords || ''
                keywords = keywords.split(',');
                for (i=0; i<keywords.length; i++) {
                    keywordsString +=  'k=' + encodeURIComponent(keywords[i].toLowerCase().replace(/ /g,"-")) + '&'
                }

                var pageUrl = guardian.page.canonicalUrl.replace('http://', '') + '/oas.html';
                var random = (new String (Math.random())).substring (2, 11);
                var pageType = guardian.page.contentType.toLowerCase();

                var adSlots = [];
                switch (detect.getLayoutMode()) {
                    case 'base':
                        adSlots = [
                            {name: 'x50', position: '#ad-slot-top-banner'}
                        ];
                        break;
                    case 'median':
                        adSlots = [
                            {name: 'x52', position: '#ad-slot-top-banner'}
                        ];
                        break;
                    case 'extended':
                        adSlots = [
                            {name: 'x54', position: '#ad-slot-top-banner'}
                        ];
                        break;
                }

                function exists(selector) {
                    return document.querySelector(selector);
                }

                var slotsOnPage = ''
                for (i=0; i< adSlots.length; i++) {
                    if (exists(adSlots[i].position)) {
                        slotsOnPage += adSlots[i].name + ',';
                    }
                }

                writeCapture.support.ajax({
                    url: 'http://oas.guardian.co.uk/RealMedia/ads/adstream_mjx.ads/' + pageUrl + '/' + random + '@' + slotsOnPage + '?' + keywordsString + '&pt=' + pageType + '&ct=' + pageType,
                    success: function(){
                        for (i=0; i< adSlots.length; i++) {
                            renderSlot(adSlots[i])
                        }
                    },
                    dataType : "script"
                    }
                )
            }
    );
}

require([guardian.js.modules["$g"]], function($g){
    $g.onReady(loadAds);
});
