package controllers

import conf.{AllGoodCachedHealthCheck, ExpiringSingleHealthCheck}
import contentapi.SectionsLookUp
import play.api.mvc.{Action, AnyContent}

import scala.concurrent.Future

class HealthCheck extends AllGoodCachedHealthCheck(
  9002,
  ExpiringSingleHealthCheck("/books"),
  ExpiringSingleHealthCheck("/books/harrypotter"),
  ExpiringSingleHealthCheck("/travel/gallery/2012/nov/20/st-petersburg-pushkin-museum"),
  ExpiringSingleHealthCheck("/travel/gallery/2012/nov/20/st-petersburg-pushkin-museum?index=2"),
  ExpiringSingleHealthCheck("/world/video/2012/nov/20/australian-fake-bomber-sentenced-sydney-teenager-video")
) {
  override def healthCheck(): Action[AnyContent] = Action.async { request =>
    if (!SectionsLookUp.isLoaded()) {
      Future.successful(InternalServerError("Sections have not loaded from Content API"))
    } else {
      super.healthCheck()(request)
    }
  }
}
