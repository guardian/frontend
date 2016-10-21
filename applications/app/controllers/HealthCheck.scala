package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import contentapi.SectionsLookUp
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent}
import scala.concurrent.Future

class HealthCheck(wsClient: WSClient, sectionsLookUp: SectionsLookUp) extends AllGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck("/books"),
  NeverExpiresSingleHealthCheck("/books/harrypotter"),
  NeverExpiresSingleHealthCheck("/news/gallery/2012/oct/02/24-hours-in-pictures"),
  NeverExpiresSingleHealthCheck("/news/gallery/2012/oct/02/24-hours-in-pictures?index=2"),
  NeverExpiresSingleHealthCheck("/world/video/2012/dec/31/52-weeks-photos-2012-video")
)(wsClient) {
  override def healthCheck(): Action[AnyContent] = Action.async { request =>
    if (!sectionsLookUp.isLoaded()) {
      Future.successful(InternalServerError("Sections have not loaded from Content API"))
    } else {
      super.healthCheck()(request)
    }
  }
}
