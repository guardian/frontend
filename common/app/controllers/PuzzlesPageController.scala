package controllers

import common.ImplicitControllerExecutionContext
import implicits.{HtmlFormat, JsonFormat}
import implicits.Requests.RichRequestHeader
import model.dotcomrendering.DotcomPuzzlesPageRenderingDataModel
import model.{ApplicationContext, CacheTime, Cached}
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import staticpages.StaticPages

import scala.concurrent.Future

class PuzzlesPageController(
    wsClient: WSClient,
    puzzlesLayoutProvider: PuzzlesLayoutProvider,
    remoteRenderer: DotcomRenderingService,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext {

  private def notFound(implicit request: RequestHeader): Future[Result] =
    Future.successful(
      Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound)),
    )

  def renderPuzzles(): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case HtmlFormat =>
          val page = StaticPages.dcrSimplePuzzlesPage(request.path)

          puzzlesLayoutProvider.getLayout().flatMap { layout =>
            val renderingData = DotcomPuzzlesPageRenderingDataModel(page, layout, request)
            remoteRenderer.getPuzzlesPage(
              wsClient,
              DotcomPuzzlesPageRenderingDataModel.toJson(renderingData),
            )
          }
        case _ => notFound
      }
    }

  def renderPuzzlesJson(): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case JsonFormat =>
          val page = StaticPages.dcrSimplesPuzzlesPage(request.path)

          puzzlesLayoutProvider.getLayout().map { layout =>
            val renderingData = DotcomPuzzlesPageRenderingDataModel(page, layout, request)
            common
              .renderJson(DotcomPuzzlesPageRenderingDataModel.toJson(renderingData), page)
              .as("application/json")
          }
        case _ => notFound
      }
    }
}
