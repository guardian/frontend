package services

import app.LifecycleComponent
import com.gu.facia.api.CustomSubnavService
import com.gu.facia.api.models.PublicationStatus
import com.gu.facia.api.models.PublicationStatus.{Draft, Live}
import com.gu.facia.client.ApiClient
import com.gu.facia.client.models.TargetedPageType.Front
import com.gu.facia.client.models.{CustomSubnav, CustomSubnavConfig}
import common._
import fronts.FrontsApi
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

/** SubnavAgent is a cache for the custom subnav config.
  *
  * The config is authored in CMS Fronts and describes bespoke sub-navigations that can be targeted at specific fronts,
  * articles or tags. It is pulled from a single file in S3 in the CMS Fronts AWS account (via the Fronts API client).
  */
class SubnavAgent extends GuLogging {
  private val subnavConfigBox = Box[Option[CustomSubnavConfig]](None)

  def isLoaded(): Boolean = subnavConfigBox.get().isDefined

  def getSubnavConfig(): Option[CustomSubnavConfig] = subnavConfigBox.get()

  /** Look up the custom subnav targeted at the given front, if any. */
  def getSubnavForFront(frontId: String, status: PublicationStatus = Live): Option[CustomSubnav] = {
    getSubnavConfig().flatMap { config =>
      CustomSubnavService.getSubnavForFront(config, frontId, status)
    }
  }

  def getClient(implicit ec: ExecutionContext): ApiClient = FrontsApi.crossAccountClient

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    val futureConfig = getClient.subnavConfig()
    futureConfig.onComplete {
      case Success(_) => log.debug("Successfully got subnav config")
      case Failure(t) => log.error(s"Getting subnav config failed with $t", t)
    }
    futureConfig.map(subnavConfigBox.send)
  }
}

class SubnavAgentLifecycle(
    subnavAgent: SubnavAgent,
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
)(implicit
    ec: ExecutionContext,
) extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("SubnavAgentJob")
    }
  }

  override def start(): Unit = {
    jobs.deschedule("SubnavAgentJob")
    jobs.schedule("SubnavAgentJob", "15 * * * * ?") {
      subnavAgent.refresh()
    }

    pekkoAsync.after1s {
      subnavAgent.refresh()
    }
  }
}
