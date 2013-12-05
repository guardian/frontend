import common._
import conf.Management
import conf.RequestMeasurementMetrics
import dev.DevParametersLifecycle
import model.commercial.masterclasses.MasterClassAgent
import model.commercial.jobs.{Industries, JobsAgent}
import model.commercial.soulmates.SoulmatesAggregatingAgent
import model.commercial.travel.{Countries, OffersAgent}
import play.api.mvc.WithFilters
import play.api.{Application => PlayApp, GlobalSettings}
import scala.util.{Failure, Success, Random}

trait CommercialLifecycle extends GlobalSettings with Logging with ExecutionContexts {

  override def onStart(app: PlayApp) {

    val randomFactor = Random.nextInt(15)
    def randomStartSchedule(minsLater: Int = 0) = s"0 ${randomFactor + minsLater}/15 * * * ?"

    super.onStart(app)

    Jobs.deschedule("SoulmatesRefreshJob")
    Jobs.deschedule("MasterClassRefreshJob")
    Jobs.deschedule("CountryRefreshJob")
    Jobs.deschedule("TravelOffersRefreshJob")
    Jobs.deschedule("IndustryRefreshJob")
    Jobs.deschedule("JobsRefreshJob")

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
    val countryRefreshSchedule = randomStartSchedule(minsLater = 2)
    log.info(s"Country refresh on schedule $countryRefreshSchedule")
    Jobs.schedule("CountryRefreshJob", countryRefreshSchedule) {
      Countries.refresh()
    }

    // fire every 15 mins
    val travelRefreshSchedule = randomStartSchedule(minsLater = 3)
    log.info(s"Travel offers refresh on schedule $travelRefreshSchedule")
    Jobs.schedule("TravelOffersRefreshJob", travelRefreshSchedule) {
      OffersAgent.refresh()
    }

    // fire every 15 mins
    val industryRefreshSchedule = randomStartSchedule(minsLater = 4)
    log.info(s"Industry refresh on schedule $industryRefreshSchedule")
    Jobs.schedule("IndustryRefreshJob", industryRefreshSchedule) {
      Industries.refresh()
    }

    // fire every 15 mins
    val jobsRefreshSchedule = randomStartSchedule(minsLater = 5)
    log.info(s"Jobs refresh on schedule $jobsRefreshSchedule")
    Jobs.schedule("JobsRefreshJob", jobsRefreshSchedule) {
      JobsAgent.refresh()
    }

    AkkaAsync {
      SoulmatesAggregatingAgent.refresh()

      MasterClassAgent.refresh()

      Countries.refresh() andThen {
        case Success(_) => OffersAgent.refresh()
        case Failure(e) => log.warn(s"Failed to refresh travel offer countries: ${e.getMessage}")
      }

      Industries.refresh() andThen {
        case Success(_) => JobsAgent.refresh()
        case Failure(e) => log.warn(s"Failed to refresh job industries: ${e.getMessage}")
      }
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("SoulmatesRefreshJob")
    Jobs.deschedule("MasterClassRefreshJob")
    Jobs.deschedule("CountryRefreshJob")
    Jobs.deschedule("TravelOffersRefreshJob")
    Jobs.deschedule("IndustryRefreshJob")
    Jobs.deschedule("JobsRefreshJob")

    SoulmatesAggregatingAgent.stop()
    MasterClassAgent.stop()
    Countries.stop()
    OffersAgent.stop()
    Industries.stop()
    JobsAgent.stop()

    super.onStop(app)
  }
}

object Global
  extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with CommercialLifecycle with DevParametersLifecycle
  with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName
}
