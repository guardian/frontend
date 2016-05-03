@(item: model.MetaData)(implicit request: RequestHeader)
@import conf.switches.Switches._

@if(OfflinePageView.isSwitchedOn) {
    try {
        var offlineViews = parseInt(localStorage.getItem('gu.offlineViews'));
        for (var i = 0; i < offlineViews; i++) {
            (new Image()).src = window.guardian.config.page.beaconUrl + '/count/offline-page-view.gif';
        }
        localStorage.removeItem('gu.offlineViews');
    } catch (e) {
        // do nothing
    }
}
