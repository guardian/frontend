import common.{CommercialMetrics, Jobs}
import model.commercial.travel.OffersAgent
import play.api.{Application => PlayApp, Play, GlobalSettings}
import play.api.Play.current

trait TravelOffersLifecycle extends GlobalSettings {

  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("TravelOffersRefreshJob")

    // fire every 15 mins
    Jobs.schedule("TravelOffersRefreshJob", "0 2/15 * * * ?", CommercialMetrics.TravelOffersLoadTimingMetric) {
      OffersAgent.refresh()
    }

    if (Play.isTest) {
      OffersAgent.refresh()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("TravelOffersRefreshJob")
    super.onStop(app)
  }
}


object Global extends TravelOffersLifecycle
