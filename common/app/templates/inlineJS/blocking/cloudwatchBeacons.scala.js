@(item: model.MetaData)(implicit request: RequestHeader)
@import conf.switches.Switches._

@if(OfflineCrosswordView.isSwitchedOn) {
    try {
        var offlineViews = parseInt(localStorage.getItem('gu.offlineViews'));
        for (var i = 0; i < offlineViews; i++) {
            (new Image()).src = window.guardian.config.page.beaconUrl + '/count/offline-crossword-view.gif';
        }
        localStorage.removeItem('gu.offlineViews');
    } catch (e) {
        // do nothing
    }
}
