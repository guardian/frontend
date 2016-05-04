@(item: model.MetaData)(implicit request: RequestHeader)
@import conf.switches.Switches._

@if(OfflinePageView.isSwitchedOn) {
    (function () {
        try {
            var cookies = document.cookie.split(';');
            var offlineViews = 0;
            for (var len = cookies.length, i = 0; i < len ; i++) {
                var data = cookies[i].split('=');
                if (data[0].indexOf('gu.offlineViews') !== -1) {
                    offlineViews = parseInt(data[1]);
                    break;
                }
            }
            for (var i = 0; i < offlineViews; i++) {
                (new Image()).src = window.guardian.config.page.beaconUrl + '/count/offline-page-view.gif';
            }
            document.cookie = 'gu.offlineViews=0;Max-Age=0';
        } catch (e) {};
    })();
}
