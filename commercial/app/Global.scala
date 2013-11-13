import common.{AkkaAsync, CommercialMetrics, Jobs}
import conf.RequestMeasurementMetrics
import dev.DevParametersLifecycle
import model.commercial.jobs.JobsAgent
import model.commercial.travel.OffersAgent
import play.api.mvc.WithFilters
import play.api.{Application => PlayApp, GlobalSettings}

trait CommercialLifecycle extends GlobalSettings {

  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("TravelOffersRefreshJob")
    Jobs.deschedule("JobsRefreshJob")


    // fire every 15 mins
    Jobs.schedule("TravelOffersRefreshJob", "0 2/15 * * * ?", CommercialMetrics.TravelOffersLoadTimingMetric) {
      OffersAgent.refresh()
    }

    // fire every 15 mins
    Jobs.schedule("JobsRefreshJob", "0 7/15 * * * ?", CommercialMetrics.JobsLoadTimingMetric) {
      JobsAgent.refresh()
    }

    AkkaAsync{
      OffersAgent.refresh()
      JobsAgent.refresh()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("TravelOffersRefreshJob")
    Jobs.deschedule("JobsRefreshJob")
    super.onStop(app)
  }
}


object Global
  extends WithFilters(RequestMeasurementMetrics.asFilters: _*)
  with CommercialLifecycle
  with DevParametersLifecycle
