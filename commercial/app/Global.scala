import common._
import conf.Management
import conf.RequestMeasurementMetrics
import dev.DevParametersLifecycle
import model.commercial.masterclasses.MasterClassAgent
import model.commercial.jobs.{Industries, JobsAgent}
import model.commercial.moneysupermarket.MoneysupermarketAggregatingAgent
import model.commercial.soulmates.SoulmatesAggregatingAgent
import model.commercial.travel.{Countries, OffersAgent}
import play.api.mvc.WithFilters
import play.api.{Application => PlayApp, GlobalSettings}
import scala.util.{Failure, Success, Random}

trait CommercialLifecycle extends GlobalSettings with Logging with ExecutionContexts {

  private val refreshJobs: List[RefreshJob] = List {
    SoulmatesRefresh
    MasterclassesRefresh
    CountriesRefresh
    TravelOffersRefresh
    IndustriesRefresh
    JobsRefresh
    MoneySupermarketRefresh
  }

  override def onStart(app: PlayApp) {

    val randomFactor = Random.nextInt(15)

    def randomStartSchedule(minsLater: Int = 0) = s"0 ${randomFactor + minsLater}/15 * * * ?"

    super.onStart(app)

    refreshJobs.zipWithIndex foreach {
      case (job, i) => job.start(randomStartSchedule(minsLater = i))
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

      MoneysupermarketAggregatingAgent.refresh()
    }
  }

  override def onStop(app: PlayApp) {
    refreshJobs foreach (_.stop())

    super.onStop(app)
  }
}

object Global
  extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with CommercialLifecycle with DevParametersLifecycle
  with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName
}

trait RefreshJob extends Logging {
  val name: String

  protected def refresh()

  protected def stopJob()

  def start(schedule: String) {
    Jobs.deschedule(s"${name}RefreshJob")

    log.info(s"$name refresh on schedule $schedule")
    Jobs.schedule(s"${name}RefreshJob", schedule) {
      refresh()
    }
  }

  def stop() {
    Jobs.deschedule(s"${name}RefreshJob")
    stopJob()
  }
}

object SoulmatesRefresh extends RefreshJob {
  val name: String = "Soulmates"

  def refresh() = SoulmatesAggregatingAgent.refresh()

  def stopJob() = SoulmatesAggregatingAgent.stop()
}

object MasterclassesRefresh extends RefreshJob {
  val name: String = "Masterclasses"

  def refresh() = MasterClassAgent.refresh()

  def stopJob() = MasterClassAgent.stop()
}

object CountriesRefresh extends RefreshJob {
  val name: String = "Countries"

  def refresh() = Countries.refresh()

  def stopJob() = Countries.stop()
}

object TravelOffersRefresh extends RefreshJob {
  val name: String = "TravelOffers"

  def refresh() = OffersAgent.refresh()

  def stopJob() = OffersAgent.stop()
}

object IndustriesRefresh extends RefreshJob {
  val name: String = "Industries"

  def refresh() = Industries.refresh()

  def stopJob() = Industries.stop()
}

object JobsRefresh extends RefreshJob {
  val name: String = "Jobs"

  def refresh() = JobsAgent.refresh()

  def stopJob() = JobsAgent.stop()
}

object MoneySupermarketRefresh extends RefreshJob {
  val name: String = "MoneySupermarket"

  def refresh() = MoneysupermarketAggregatingAgent.refresh()

  def stopJob() = MoneysupermarketAggregatingAgent.stop()
}
