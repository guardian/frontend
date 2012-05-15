define([guardian.js.modules.writeCaptureNoLibSupport, guardian.js.modules.writeCapture, guardian.js.modules.detect], function(wcs, wc, detect){

    function renderSlot(slot) {
        writeCapture.html(slot.position, '<script' + '>OAS_RICH("' + slot.name + '")</scr' + 'ipt>');
        var node = document.querySelector(slot.position);
        if (node) { node.className = '' };
    }

    var keywordsString='';
    var keywords = guardian.page.keywords.split(',');
    for (i=0; i<keywords.length; i++) {
        keywordsString +=  'k=' + encodeURIComponent(keywords[i].toLowerCase()) + '&'
    }

    var pageUrl = guardian.page.canonicalUrl.replace('http://', '') + '/oas.html';
    var random = (new String (Math.random())).substring (2, 11);
    var pageType = guardian.page.contentType.toLowerCase();

    var adSlots = [];
    switch (detect.getLayoutMode()) {
        case 'base':
            adSlots = [
                {name: 'x50', position: '#tier1-2'},
                {name: 'x51', position: '#tier3-5'}
            ];
            break;
        case 'median':
            adSlots = [
                {name: 'x52', position: '#tier1-2'},
                {name: 'x53', position: '#tier3-5'}
            ];
            break;
        case 'extended':
            adSlots = [
                {name: 'x54', position: '#tier1-2'},
                {name: 'x55', position: '#tier2-1'},
                {name: 'x56', position: '#tier3-5'}
            ];
            break;
    }

    var slotsOnPage = ''
    for (i=0; i< adSlots.length; i++) {
        slotsOnPage += adSlots[i].name + ',';
    }

    writeCapture.support.ajax({
        url: 'http://oas.guardian.co.uk/RealMedia/ads/adstream_mjx.ads/' + pageUrl + '/' + random + '@' + slotsOnPage + '?' + keywordsString + '&pt=' + pageType + '&ct=' + pageType,
        success: function(){
            for (i=0; i< adSlots.length; i++) {
                renderSlot(adSlots[i]);
            }
        },
        dataType : "script"
        }
    )


});
