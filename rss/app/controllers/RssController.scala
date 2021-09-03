package controllers

import common._
import contentapi.{ContentApiClient, SectionsLookUp}
import model.Cached.RevalidatableResult
import model._
import play.api.mvc.{ControllerComponents, RequestHeader, Result}
import services.IndexPage

class RssController(
    val contentApiClient: ContentApiClient,
    val sectionsLookUp: SectionsLookUp,
    val controllerComponents: ControllerComponents,
)(implicit val context: ApplicationContext)
    extends IndexControllerCommon {
  override protected def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader): Result =
    Cached(model.page) {
      val body = TrailsToRss(model.page.metadata, model.trails)
      RevalidatableResult(Ok(body).as("text/xml; charset=utf-8"), body)
    }
}
