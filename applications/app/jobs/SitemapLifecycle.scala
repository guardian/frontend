package jobs

import app.LifecycleComponent
import common._
import contentapi.ContentApiClient
import services.{NewsSiteMap, VideoSiteMap}

import scala.concurrent.ExecutionContext

class SiteMapLifecycle(jobs: JobScheduler, akkaAsync: AkkaAsync, siteMapJob: SiteMapJob)(implicit ec: ExecutionContext)
    extends LifecycleComponent {

  override def start(): Unit = {
    jobs.deschedule("SiteMap")
    jobs.schedule("SiteMap", "0 0/2 * * * ?") {
      siteMapJob.update()
    }

    akkaAsync.after1s {
      siteMapJob.update()
    }
  }
}

class SiteMapJob(contentApiClient: ContentApiClient) extends GuLogging {
  case class SiteMapContent(news: xml.NodeSeq, video: xml.NodeSeq)

  private val newsSiteMap = new NewsSiteMap(contentApiClient)
  private val videoSiteMap = new VideoSiteMap(contentApiClient)
  private val siteMapContent = Box[Option[SiteMapContent]](None)

  def update()(implicit executionContext: ExecutionContext): Unit = {
    for {
      newsSiteMap <- newsSiteMap.getLatestContent()
      videoSiteMap <- videoSiteMap.getLatestContent()
    } {
      siteMapContent.send(Some(SiteMapContent(newsSiteMap, videoSiteMap)))
    }
  }

  def siteMaps(): Option[SiteMapContent] = siteMapContent()
}
