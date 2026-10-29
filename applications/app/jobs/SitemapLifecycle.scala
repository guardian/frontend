package jobs

import app.LifecycleComponent
import common._
import contentapi.ContentApiClient
import services.{FilterSiteMap, NewsSiteMap, VideoSiteMap}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Try}

class SiteMapLifecycle(jobs: JobScheduler, pekkoAsync: PekkoAsync, siteMapJob: SiteMapJob)(implicit
    ec: ExecutionContext,
) extends LifecycleComponent {

  override def start(): Unit = {
    jobs.deschedule("SiteMap")
    jobs.schedule("SiteMap", "0 0/2 * * * ?") {
      siteMapJob.update()
      siteMapJob.updateFilter()
    }

    pekkoAsync.after1s {
      siteMapJob.update()
      siteMapJob.updateFilter()
    }
  }
}

class SiteMapJob(contentApiClient: ContentApiClient, filterSiteMapService: FilterSiteMap) extends GuLogging {
  case class SiteMapContent(news: xml.NodeSeq, video: xml.NodeSeq)

  private val newsSiteMap = new NewsSiteMap(contentApiClient)
  private val videoSiteMap = new VideoSiteMap(contentApiClient)
  private val siteMapContent = Box[Option[SiteMapContent]](None)

  private val filterSiteMapContent = Box[Map[FilterSiteMap.Region, xml.NodeSeq]](Map.empty)

  def update()(implicit executionContext: ExecutionContext): Unit = {
    for {
      newsSiteMap <- newsSiteMap.getLatestContent()
      videoSiteMap <- videoSiteMap.getLatestContent()
    } {
      siteMapContent.send(Some(SiteMapContent(newsSiteMap, videoSiteMap)))
    }
  }

  def siteMaps(): Option[SiteMapContent] = siteMapContent()

  def updateFilter()(implicit executionContext: ExecutionContext): Future[Unit] = {
    // Replace both regions together only after every source and page has loaded and passed validation.
    Future
      .fromTry(Try(filterSiteMapService.buildLatestSitemaps()))
      .flatten
      .map(_.foreach(filterSiteMapContent.send))
      .andThen { case Failure(error) =>
        log.error("Failed to refresh Filter sitemaps; retaining the last successful result", error)
      }
  }

  def filterSiteMapIndex(): Option[xml.NodeSeq] =
    Option.when(FilterSiteMap.regions.forall(filterSiteMapContent().contains))(FilterSiteMap.index)

  def filterSiteMap(region: FilterSiteMap.Region): Option[xml.NodeSeq] = filterSiteMapContent().get(region)
}
