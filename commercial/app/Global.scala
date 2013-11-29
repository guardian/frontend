import common.CloudWatchApplicationMetrics
import conf.Management
import common.{Logging, AkkaAsync, Jobs}
import conf.RequestMeasurementMetrics
import dev.DevParametersLifecycle
import model.commercial.masterclasses.MasterClassAgent
import model.commercial.jobs.JobsAgent
import model.commercial.soulmates.SoulmatesAggregatingAgent
import model.commercial.travel.OffersAgent
import play.api.mvc.WithFilters
import play.api.{Application => PlayApp, GlobalSettings}
import scala.util.Random

trait CommercialLifecycle extends GlobalSettings with Logging {

  override def onStart(app: PlayApp) {

    val randomFactor = Random.nextInt(15)
    def randomStartSchedule(minsLater: Int = 0) = s"0 ${randomFactor + minsLater}/15 * * * ?"

    super.onStart(app)

    Jobs.deschedule("TravelOffersRefreshJob")
    Jobs.deschedule("JobsRefreshJob")
    Jobs.deschedule("MasterClassRefreshJob")
    Jobs.deschedule("SoulmatesRefreshJob")

    // fire every 15 mins
    val soulmatesRefreshSchedule = randomStartSchedule()
    log.info(s"Soulmates refresh on schedule $soulmatesRefreshSchedule")
    Jobs.schedule("SoulmatesRefreshJob", soulmatesRefreshSchedule) {
      SoulmatesAggregatingAgent.refresh()
    }

    // fire every 15 minutes
    val masterClassRefreshSchedule = randomStartSchedule(minsLater = 1)
    log.info(s"Masterclass refresh on schedule $masterClassRefreshSchedule")
    Jobs.schedule("MasterClassRefreshJob", masterClassRefreshSchedule) {
      MasterClassAgent.refresh()
    }

    // fire every 15 mins
    val travelRefreshSchedule = randomStartSchedule(minsLater = 2)
    log.info(s"Travel offers refresh on schedule $travelRefreshSchedule")
    Jobs.schedule("TravelOffersRefreshJob", travelRefreshSchedule) {
      OffersAgent.refresh()
    }

    // fire every 15 mins
    val jobsRefreshSchedule = randomStartSchedule(minsLater = 3)
    log.info(s"Jobs refresh on schedule $jobsRefreshSchedule")
    Jobs.schedule("JobsRefreshJob", jobsRefreshSchedule) {
      JobsAgent.refresh()
    }

    AkkaAsync {
      SoulmatesAggregatingAgent.refresh()
      MasterClassAgent.refresh()
      OffersAgent.refresh()
      JobsAgent.refresh()
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

    super.onStop(app)
  }
}

object Global
  extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with CommercialLifecycle with DevParametersLifecycle
  with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName
}
