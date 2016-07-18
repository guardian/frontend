package jobs

import app.LifecycleComponent
import common._
import services.{VideoSiteMap, NewsSiteMap}

import scala.concurrent.ExecutionContext

class SiteMapLifecycle(jobs: JobScheduler, akkaAsync: AkkaAsync)(implicit ec: ExecutionContext) extends LifecycleComponent {

  override def start(): Unit = {
    jobs.deschedule("SiteMap")
    jobs.schedule("SiteMap", "0 0/2 * * * ?") {
      SiteMapJob.update()
    }

    akkaAsync.after1s {
      SiteMapJob.update()
    }
  }
}

object SiteMapJob extends ExecutionContexts with Logging {
  case class SiteMapContent(
    news: xml.NodeSeq,
    video: xml.NodeSeq)

  private val siteMapContent = AkkaAgent[Option[SiteMapContent]](None)

  def update(): Unit = {
    for {
      newsSiteMap <- NewsSiteMap.getLatestContent
      videoSiteMap <- VideoSiteMap.getLatestContent
    } {
      siteMapContent.send(Some(SiteMapContent(newsSiteMap, videoSiteMap)))
    }
  }

  def siteMaps(): Option[SiteMapContent] = siteMapContent()
}


