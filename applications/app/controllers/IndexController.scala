package controllers

import common._
import contentapi.{ContentApiClient, SectionsLookUp}
import model.Cached.RevalidatableResult
import model._
import model.dotcomrendering.{DotcomIndexPageRenderingDataModel, PageType}
import pages.IndexHtmlPage
import play.api.mvc.{ControllerComponents, RequestHeader, Result}
import services.IndexPage

class IndexController(
    val contentApiClient: ContentApiClient,
    val sectionsLookUp: SectionsLookUp,
    val controllerComponents: ControllerComponents,
)(implicit val context: ApplicationContext)
    extends IndexControllerCommon {
  protected def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader): Result = {
    Cached(model.page) {
      if (request.isRss) {
        val body = TrailsToRss(model.page.metadata, model.trails)
        RevalidatableResult(Ok(body).as("text/xml; charset=utf-8"), body)
      } else if (request.isJson) {
        if (request.forceDCR) {
          JsonComponent.fromWritable(
            DotcomIndexPageRenderingDataModel(
              page = model,
              request = request,
              pageType = PageType(model, request, context),
            ),
          )
        } else {
          JsonComponent(views.html.fragments.indexBody(model))
        }
      } else {
        RevalidatableResult.Ok(IndexHtmlPage.html(model))
      }
    }
  }
}
