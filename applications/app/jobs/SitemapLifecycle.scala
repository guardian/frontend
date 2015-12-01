package jobs

import common._
import play.api.GlobalSettings
import services.{VideoSiteMap, NewsSiteMap}

trait SiteMapLifecycle extends GlobalSettings with ExecutionContexts {

  override def onStart(app: play.api.Application) {
    super.onStart(app)

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


