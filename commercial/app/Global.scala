import common._
import conf.{SwitchboardLifecycle, CorsErrorHandler, Filters}
import dev.DevParametersLifecycle
import model.commercial.books.BestsellersAgent
import model.commercial.jobs.{Industries, JobsAgent}
import model.commercial.masterclasses.{MasterClassAgent, MasterClassTagsAgent}
import model.commercial.money.BestBuysAgent
import model.commercial.soulmates.SoulmatesAgent
import model.commercial.travel.{Countries, TravelOffersAgent}
import play.api.mvc.WithFilters
import play.api.{Application => PlayApp, GlobalSettings}

import scala.util.{Failure, Random, Success}

trait CommercialLifecycle extends GlobalSettings with Logging with ExecutionContexts {

  private val refreshJobs: List[RefreshJob] = List(
    SoulmatesRefresh,
    MasterClassTagsRefresh,
    MasterclassesRefresh,
    CountriesRefresh,
    IndustriesRefresh,
    JobsRefresh,
    MoneyBestBuysRefresh,
    BooksRefresh,
    TravelOffersRefresh
  )

  override def onStart(app: PlayApp) {

    val randomFactor = Random.nextInt(15)

    def randomStartSchedule(minsLater: Int = 0) = s"0 ${randomFactor + minsLater}/15 * * * ?"

    super.onStart(app)

    refreshJobs.zipWithIndex foreach {
      case (job, i) => job.start(randomStartSchedule(minsLater = i))
    }

    AkkaAsync {
      SoulmatesAgent.refresh()

      MasterClassTagsAgent.refresh() andThen {
        case Success(_) => MasterClassAgent.refresh()
        case Failure(e) => log.warn(s"Failed to refresh master class tags: ${e.getMessage}")
      }

      Countries.refresh() andThen {
        case Success(_) => TravelOffersAgent.refresh()
        case Failure(e) => log.warn(s"Failed to refresh travel offer countries: ${e.getMessage}")
      }

      Industries.refresh() andThen {
        case Success(_) => JobsAgent.refresh()
        case Failure(e) => log.warn(s"Failed to refresh job industries: ${e.getMessage}")
      }

      BestBuysAgent.refresh()

      BestsellersAgent.refresh()
      TravelOffersRefresh.refresh()
    }
  }

  override def onStop(app: PlayApp) {
    refreshJobs foreach (_.stop())

    super.onStop(app)
  }
}

object Global extends WithFilters(Filters.common: _*)
  with CommercialLifecycle
  with DevParametersLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with CorsErrorHandler {
  override lazy val applicationName = "frontend-commercial"
}

trait RefreshJob extends Logging {
  val name: String

  protected def refresh()

  def start(schedule: String) {
    Jobs.deschedule(s"${name}RefreshJob")

    log.info(s"$name refresh on schedule $schedule")
    Jobs.schedule(s"${name}RefreshJob", schedule) {
      refresh()
    }
  }

  def stop() {
    Jobs.deschedule(s"${name}RefreshJob")
  }
}

object SoulmatesRefresh extends RefreshJob with ExecutionContexts {
  val name: String = "Soulmates"

  def refresh() = SoulmatesAgent.refresh()
}

object MasterClassTagsRefresh extends RefreshJob {
  val name: String = "MasterClassTags"

  def refresh() = MasterClassTagsAgent.refresh()
}

object MasterclassesRefresh extends RefreshJob {
  val name: String = "Masterclasses"

  def refresh() = MasterClassAgent.refresh()
}

object CountriesRefresh extends RefreshJob {
  val name: String = "Countries"

  def refresh() = Countries.refresh()

}

object TravelOffersRefresh extends RefreshJob {
  val name: String = "TravelOffers"

  def refresh() = TravelOffersAgent.refresh()
}

object IndustriesRefresh extends RefreshJob {
  val name: String = "Industries"

  def refresh() = Industries.refresh()
}

object JobsRefresh extends RefreshJob {
  val name: String = "Jobs"

  def refresh() = JobsAgent.refresh()
}

object MoneyBestBuysRefresh extends RefreshJob {
  val name: String = "Best Buys"

  def refresh() = BestBuysAgent.refresh()
}

object BooksRefresh extends RefreshJob {
  val name: String = "Books"

  def refresh() = BestsellersAgent.refresh()
}
