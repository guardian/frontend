var loadAds = function(){
    require([
        guardian.js.modules.writeCaptureNoLibSupport,
        guardian.js.modules.writeCapture,
        guardian.js.modules.detect],
            function(wcs, wc, detect) {

                var dataName = "data-" + detect.getLayoutMode();

                function renderSlot(slot) {
                    var placeholderId = '#' + slot.getAttribute("id");
                    var slotName = slot.getAttribute(dataName);
                    writeCapture.html(placeholderId, '<script' + '>OAS_RICH("' + slotName + '")</scr' + 'ipt>');
                }

                var keywordsString='';
                var keywords = guardian.page.keywords || ''
                keywords = keywords.split(',');
                for (i=0; i<keywords.length; i++) {
                    keywordsString +=  'k=' + encodeURIComponent(keywords[i].toLowerCase().replace(/ /g,"-")) + '&'
                }

                var pageUrl = guardian.page.canonicalUrl.replace('http://', '') + '/oas.html';
                var random = (new String (Math.random())).substring(2, 11);
                var pageType = guardian.page.contentType.toLowerCase();

                var slots = document.querySelectorAll(".ad-slot");

                var slotsOnPage = '';
                for (i=0; i< slots.length; i++) {
                    slotsOnPage += slots[i].getAttribute(dataName) + ',';
                }

                writeCapture.support.ajax({
                    url: 'http://oas.guardian.co.uk/RealMedia/ads/adstream_mjx.ads/' + pageUrl + '/' + random + '@' + slotsOnPage + '?' + keywordsString + '&pt=' + pageType + '&ct=' + pageType,
                    success: function(){
                        for (i=0; i< slots.length; i++) {
                            renderSlot(slots[i])
                        }
                    },
                    dataType : "script"
                    }
                )
            }
    );
};

require([guardian.js.modules["$g"]], function($g){
    $g.onReady(loadAds);
});
