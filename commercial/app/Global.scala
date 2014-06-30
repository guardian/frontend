import common._
import conf.Filters
import conf.Management
import dev.DevParametersLifecycle
import model.commercial.books.BestsellersAgent
import model.commercial.jobs.{Industries, JobsAgent}
import model.commercial.masterclasses.{MasterClassTagsAgent, MasterClassAgent}
import model.commercial.money.BestBuysAgent
import model.commercial.soulmates.SoulmatesAggregatingAgent
import model.commercial.travel.{Countries, OffersAgent}
import play.api.mvc.WithFilters
import play.api.{Application => PlayApp, GlobalSettings}
import scala.util.{Failure, Success, Random}

trait CommercialLifecycle extends GlobalSettings with Logging with ExecutionContexts {

  private val refreshJobs: List[RefreshJob] = List(
    SoulmatesRefresh,
    MasterClassTagsRefresh,
    MasterclassesRefresh,
    CountriesRefresh,
    TravelOffersRefresh,
    IndustriesRefresh,
    JobsRefresh,
    MoneyBestBuysRefresh,
    BooksRefresh
  )

  override def onStart(app: PlayApp) {

    val randomFactor = Random.nextInt(15)

    def randomStartSchedule(minsLater: Int = 0) = s"0 ${randomFactor + minsLater}/15 * * * ?"

    super.onStart(app)

    refreshJobs.zipWithIndex foreach {
      case (job, i) => job.start(randomStartSchedule(minsLater = i))
    }

    AkkaAsync {
      SoulmatesAggregatingAgent.refresh()

      MasterClassTagsAgent.refresh() andThen {
        case Success(_) => MasterClassAgent.refresh()
        case Failure(e) => log.warn(s"Failed to refresh master class tags: ${e.getMessage}")
      }

      Countries.refresh() andThen {
        case Success(_) => OffersAgent.refresh()
        case Failure(e) => log.warn(s"Failed to refresh travel offer countries: ${e.getMessage}")
      }

      Industries.refresh() andThen {
        case Success(_) => JobsAgent.refresh()
        case Failure(e) => log.warn(s"Failed to refresh job industries: ${e.getMessage}")
      }

      BestBuysAgent.refresh()

      BestsellersAgent.refresh()
    }
  }

  override def onStop(app: PlayApp) {
    refreshJobs foreach (_.stop())

    super.onStop(app)
  }
}

object Global extends WithFilters(Filters.common: _*) with CommercialLifecycle with DevParametersLifecycle
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

object MasterClassTagsRefresh extends RefreshJob {
  val name: String = "MasterClassTags"

  def refresh() = MasterClassTagsAgent.refresh()

  def stopJob() = MasterClassTagsAgent.stop()
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

object MoneyBestBuysRefresh extends RefreshJob {
  val name: String = "Best Buys"

  def refresh() = BestBuysAgent.refresh()

  def stopJob() = BestBuysAgent.stop()
}

object BooksRefresh extends RefreshJob {
  val name: String = "Books"

  def refresh() = BestsellersAgent.refresh()

  def stopJob() = BestsellersAgent.stop()
}
