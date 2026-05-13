package controllers

import common.ImplicitControllerExecutionContext
import implicits.{HtmlFormat, JsonFormat}
import implicits.Requests.RichRequestHeader
import model.{ApplicationContext, CacheTime, Cached}
import model.dotcomrendering.DotcomPuzzlesPageRenderingDataModel
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import staticpages.StaticPages

import scala.concurrent.Future

class PuzzlesPageController(
    wsClient: WSClient,
    puzzlesLayoutProvider: PuzzlesLayoutProvider,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext {

  private val remoteRenderer = DotcomRenderingService()

  def renderPuzzles(): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case HtmlFormat =>
          val page = StaticPages.dcrSimplePuzzlesPage(request.path)
          val layout = puzzlesLayoutProvider.getLayout()
          val dataModel =
            DotcomPuzzlesPageRenderingDataModel(page, layout, request)

          remoteRenderer.getPuzzlesPage(
            wsClient,
            DotcomPuzzlesPageRenderingDataModel.toJson(dataModel),
          )

        case _ =>
          Future.successful(
            Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound)),
          )
      }
    }

  def renderPuzzlesJson(): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case JsonFormat =>
          val page = StaticPages.dcrSimplePuzzlesPage(request.path)
          val layout = puzzlesLayoutProvider.getLayout()
          val dataModel =
            DotcomPuzzlesPageRenderingDataModel(page, layout, request)

          Future.successful(
            common
              .renderJson(DotcomPuzzlesPageRenderingDataModel.toJson(dataModel), page)
              .as("application/json"),
          )

        case _ =>
          Future.successful(
            Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound)),
          )
      }
    }
}