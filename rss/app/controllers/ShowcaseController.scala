package controllers

import common._
import contentapi.{ContentApiClient, SectionsLookUp}
import model.Cached.RevalidatableResult
import model._
import play.api.mvc.{ControllerComponents, RequestHeader, Result}
import services.IndexPage

class ShowcaseController(
    val contentApiClient: ContentApiClient,
    val sectionsLookUp: SectionsLookUp,
    val controllerComponents: ControllerComponents,
)(implicit val context: ApplicationContext)
    extends IndexControllerCommon {
  override protected def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader): Result = {
    Cached(model.page) {
      val allTrails = model.trails.map(_.trail)

      val singleStoryTrails = allTrails // TODO
      val rundownStories = allTrails // TODO

      val showcase = TrailsToShowcase(feedTitle = Some(model.page.metadata.webTitle), singleStories = singleStoryTrails, rundownStories = rundownStories,
      rundownContainerId = "TODO", rundownContainerTitle = "TODO")
      RevalidatableResult(Ok(showcase).as("text/xml; charset=utf-8"), showcase)
    }
  }
}
