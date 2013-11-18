import common.CloudWatchApplicationMetrics
import conf.Management
import common.{Logging, AkkaAsync, Jobs}
import conf.RequestMeasurementMetrics
import dev.DevParametersLifecycle
import model.commercial.masterclasses.MasterClassAgent
import model.commercial.jobs.{LightJobsAgent, JobsAgent}
import model.commercial.soulmates.SoulmatesAggregatingAgent
import model.commercial.travel.OffersAgent
import play.api.mvc.WithFilters
import play.api.{Application => PlayApp, GlobalSettings}
import scala.util.Random
import play.api.Play
import play.api.Play.current

trait CommercialLifecycle extends GlobalSettings with Logging {

  override def onStart(app: PlayApp) {

    def randomStartSchedule = s"0 ${Random.nextInt(15)}/15 * * * ?"

    super.onStart(app)

    Jobs.deschedule("TravelOffersRefreshJob")
    Jobs.deschedule("JobsRefreshJob")
    Jobs.deschedule("MasterClassRefreshJob")
    Jobs.deschedule("SoulmatesRefreshJob")

    // fire every 15 mins
    val travelRefreshSchedule = randomStartSchedule
    log.info(s"Travel offers refresh on schedule $travelRefreshSchedule")
    Jobs.schedule("TravelOffersRefreshJob", travelRefreshSchedule) {
      OffersAgent.refresh()
    }

    // fire every 15 mins
    val jobsRefreshSchedule = randomStartSchedule
    log.info(s"Jobs refresh on schedule $jobsRefreshSchedule")
    Jobs.schedule("JobsRefreshJob", jobsRefreshSchedule) {
      JobsAgent.refresh()
    }

    // fire every 15 minutes
    val masterClassRefreshSchedule = randomStartSchedule
    log.info(s"Masterclass refresh on schedule $masterClassRefreshSchedule")
    Jobs.schedule("MasterClassRefreshJob", masterClassRefreshSchedule) {
      MasterClassAgent.refresh()
    }

    // fire every 15 mins
    val soulmatesRefreshSchedule = randomStartSchedule
    log.info(s"Soulmates refresh on schedule $soulmatesRefreshSchedule")
    Jobs.schedule("SoulmatesRefreshJob", soulmatesRefreshSchedule) {
      SoulmatesAggregatingAgent.refresh()
    }

    AkkaAsync {
      OffersAgent.refresh()
      JobsAgent.refresh()
      SoulmatesAggregatingAgent.refresh()
      MasterClassAgent.refresh()
      if (Play.isDev) LightJobsAgent.refresh()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("TravelOffersRefreshJob")
    Jobs.deschedule("JobsRefreshJob")
    Jobs.deschedule("MasterClassRefreshJob")
    Jobs.deschedule("SoulmatesRefreshJob")

    OffersAgent.stop()
    JobsAgent.stop()
    SoulmatesAggregatingAgent.stop()
    MasterClassAgent.stop()
    LightJobsAgent.stop()

    super.onStop(app)
  }
}

object Global
  extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with CommercialLifecycle with DevParametersLifecycle
                                                                                    with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName
}
