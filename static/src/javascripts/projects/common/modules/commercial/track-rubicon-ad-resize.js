define([
    'common/modules/commercial/track-ad'
], function (
    trackAd
) {
    function trackRubiconAdResize(id) {
        return trackAd.track(id)
            .then(getIframeId)
            .then(listenForRubicon)
            .then(getDims);

        function getIframeId(isLoaded) {
            if (!isLoaded) {
                return false;
            }

            var iframe = document.getElementById(id).querySelector('iframe');
            return iframe && iframe.id;
        }

        function listenForRubicon(iFrameId) {
            return iFrameId ?
                new Promise(function (resolve) {
                    var onMessage = function onMessage(event) {
                        var origin = event.origin || event.originalEvent.origin;
                        var data;

                        // just make sure some wicked people did not try to send
                        // us a malicious message
                        if (origin !== location.protocol + '//' + location.hostname) {
                            return;
                        }

                        // other DFP events get caught by this listener, but if
                        // they're not json we don't want to use them
                        try {
                            data = JSON.parse(event.data);
                        } catch (e) {/**/}

                        if (data &&
                            data.type === 'set-ad-height' &&
                            data.value.id === iFrameId
                        ) {
                            resolve([data.value.width, data.value.height]);
                            window.removeEventListener('message', onMessage);
                        }
                    };

                    window.addEventListener('message', onMessage);
                }) :
                false;
        }

        function getDims(data) {
            return data ? [data.width, data.height] : [-1, -1];
        }
    }

    return trackRubiconAdResize;
});
