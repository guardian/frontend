package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import contentapi.SectionsLookUp
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent}

import scala.concurrent.Future

class HealthCheck(override val wsClient: WSClient) extends AllGoodCachedHealthCheck(
  wsClient,
  9002,
  NeverExpiresSingleHealthCheck("/books"),
  NeverExpiresSingleHealthCheck("/books/harrypotter"),
  NeverExpiresSingleHealthCheck("/travel/gallery/2012/nov/20/st-petersburg-pushkin-museum"),
  NeverExpiresSingleHealthCheck("/travel/gallery/2012/nov/20/st-petersburg-pushkin-museum?index=2"),
  NeverExpiresSingleHealthCheck("/world/video/2012/nov/20/australian-fake-bomber-sentenced-sydney-teenager-video")
) {
  override def healthCheck(): Action[AnyContent] = Action.async { request =>
    if (!SectionsLookUp.isLoaded()) {
      Future.successful(InternalServerError("Sections have not loaded from Content API"))
    } else {
      super.healthCheck()(request)
    }
  }
}
