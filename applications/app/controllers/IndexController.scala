package controllers

import ab.ABTests
import common._
import contentapi.{ContentApiClient, SectionsLookUp}
import model.Cached.RevalidatableResult
import model._
import model.dotcomrendering.{DotcomTagPagesRenderingDataModel, PageType}
import pages.IndexHtmlPage
import play.api.libs.ws.WSClient
import play.api.mvc.{ControllerComponents, RequestHeader, Result}
import renderers.DotcomRenderingService
import services.IndexPage
import services.dotcomrendering.{LocalRender, RemoteRender, TagPagePicker}

import scala.concurrent.Future
import scala.concurrent.Future.successful

class IndexController(
                       val contentApiClient: ContentApiClient,
                       val sectionsLookUp: SectionsLookUp,
                       val controllerComponents: ControllerComponents,
                       val ws: WSClient,
                     )(implicit val context: ApplicationContext)
  extends IndexControllerCommon {

  val remoteRenderer: DotcomRenderingService = DotcomRenderingService()

  protected def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader): Future[Result] = {
    TagPagePicker.getTier(model) match {
      case RemoteRender =>
        val maybeStorylinesContent = Option
          .when(ABTests.isUserInTestGroup("newsroom-ai-tag-page-storylines", "variant"))(
            StorylinesContent.getContent(model.metadata.id),
          )
          .getOrElse(successful(None))

        maybeStorylinesContent.flatMap { storylines =>
            val dataModel = DotcomTagPagesRenderingDataModel(
              page = model,
              request = request,
              pageType = PageType(model, request, context),
              storylinesContent = storylines
            )
            if (request.isJson) {
              successful(
                Cached(model.page) {
                  JsonComponent.fromWritable(
                    dataModel
                  )
                },
              )
            } else
              remoteRenderer.getTagPage(
                ws = ws,
                dataModel = dataModel
              )
          }

      case LocalRender =>
        successful(
          Cached(model.page) {
            if (request.isRss) {
              val body = TrailsToRss(model.page.metadata, model.trails)
              RevalidatableResult(Ok(body).as("text/xml; charset=utf-8"), body)
            } else if (request.isJson) {
              JsonComponent(views.html.fragments.indexBody(model))
            } else {
              RevalidatableResult.Ok(IndexHtmlPage.html(model))
            }
          },
        )
    }
  }
}
