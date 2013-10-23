import common.{CommercialMetrics, Jobs}
import conf.RequestMeasurementMetrics
import dev.DevParametersLifecycle
import model.commercial.travel.OffersAgent
import play.api.mvc.WithFilters
import play.api.{Application => PlayApp, GlobalSettings}

trait TravelOffersLifecycle extends GlobalSettings {

  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("TravelOffersRefreshJob")

    OffersAgent.refresh()

    // fire every 15 mins
    Jobs.schedule("TravelOffersRefreshJob", "0 2/15 * * * ?", CommercialMetrics.TravelOffersLoadTimingMetric) {
      OffersAgent.refresh()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("TravelOffersRefreshJob")
    super.onStop(app)
  }
}


object Global
  extends WithFilters(RequestMeasurementMetrics.asFilters: _*)
  with TravelOffersLifecycle
  with DevParametersLifecycle
