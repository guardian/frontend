import common.{CloudWatchApplicationMetrics, AkkaAsync, Jobs}
import conf.{Management, RequestMeasurementMetrics}
import dev.DevParametersLifecycle
import model.commercial.jobs.{LightJobsAgent, JobsAgent}
import model.commercial.travel.OffersAgent
import play.api.mvc.WithFilters
import play.api.{Application => PlayApp, GlobalSettings}
import play.api.Play
import play.api.Play.current

trait CommercialLifecycle extends GlobalSettings {

  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("TravelOffersRefreshJob")
    Jobs.deschedule("JobsRefreshJob")


    // fire every 15 mins
    Jobs.schedule("TravelOffersRefreshJob", "0 2/15 * * * ?") {
      OffersAgent.refresh()
    }

    // fire every 15 mins
    Jobs.schedule("JobsRefreshJob", "0 7/15 * * * ?") {
      JobsAgent.refresh()
    }

    AkkaAsync {
      OffersAgent.refresh()
      JobsAgent.refresh()
      if (Play.isDev) LightJobsAgent.refresh()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("TravelOffersRefreshJob")
    Jobs.deschedule("JobsRefreshJob")
    super.onStop(app)
  }
}


object Global
  extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with CommercialLifecycle with DevParametersLifecycle
                                                                                    with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName
}
