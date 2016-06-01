package jobs

import common._
import services.{VideoSiteMap, NewsSiteMap}

import scala.concurrent.ExecutionContext

class SiteMapLifecycle(implicit ec: ExecutionContext) extends LifecycleComponent {

  override def start(): Unit = {
    Jobs.deschedule("SiteMap")
    Jobs.schedule("SiteMap", "0 0/2 * * * ?") {
      SiteMapJob.update()
    }

    AkkaAsync {
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


