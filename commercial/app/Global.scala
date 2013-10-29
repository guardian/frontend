import common.{CommercialMetrics, Jobs}
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

    OffersAgent.refresh()
    JobsAgent.refresh()

    // fire every 15 mins
    Jobs.schedule("TravelOffersRefreshJob", "0 2/15 * * * ?", CommercialMetrics.TravelOffersLoadTimingMetric) {
      OffersAgent.refresh()
    }

    // fire at 3 mins past every hour
    Jobs.schedule("JobsRefreshJob", "0 3 * * * ?", CommercialMetrics.JobsLoadTimingMetric) {
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
