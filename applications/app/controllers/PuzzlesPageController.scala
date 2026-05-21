package controllers

import common.ImplicitControllerExecutionContext
import implicits.{HtmlFormat, JsonFormat}
import implicits.Requests.RichRequestHeader
import model.{ApplicationContext, CacheTime, Cached}
import model.dotcomrendering.{
  DotcomPuzzleIframePageRenderingDataModel,
  DotcomPuzzlesPageRenderingDataModel,
  PuzzleContainer,
  PuzzleItem,
}
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

  private def findPuzzleBySlug(
      containers: Seq[PuzzleContainer],
      slug: String,
  ): Option[PuzzleItem] = {
    containers.iterator
      .flatMap { container =>
        container.content.items.flatten.iterator ++
          findPuzzleBySlug(container.content.nestedContainers, slug).iterator
      }
      .find(_.slug.contains(slug))
  }

  def renderPuzzles(): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case HtmlFormat =>
          val page = StaticPages.dcrSimplePuzzlesPage(request.path)
          puzzlesLayoutProvider.getLayout().flatMap { layout =>
            val dataModel =
              DotcomPuzzlesPageRenderingDataModel(page, layout, request)

            remoteRenderer.getPuzzlesPage(
              wsClient,
              DotcomPuzzlesPageRenderingDataModel.toJson(dataModel),
            )
          }

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
          puzzlesLayoutProvider.getLayout().map { layout =>
            val dataModel =
              DotcomPuzzlesPageRenderingDataModel(page, layout, request)

            common
              .renderJson(DotcomPuzzlesPageRenderingDataModel.toJson(dataModel), page)
              .as("application/json")
          }

        case _ =>
          Future.successful(
            Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound)),
          )
      }
    }

  def renderPuzzle(slug: String): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case HtmlFormat =>
          puzzlesLayoutProvider.getLayout().flatMap { layout =>
            findPuzzleBySlug(layout.containers, slug)
              .filter(_.variant.contains("iframe-page"))
              .map { puzzle =>
                val page = StaticPages.dcrSimplePuzzleIframePage(request.path, puzzle.title)
                val dataModel =
                  DotcomPuzzleIframePageRenderingDataModel(page, puzzle, request)

                remoteRenderer.getPuzzleIframePage(
                  wsClient,
                  DotcomPuzzleIframePageRenderingDataModel.toJson(dataModel),
                )
              }
              .getOrElse(
                Future.successful(
                  Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound)),
                ),
              )
          }

        case _ =>
          Future.successful(
            Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound)),
          )
      }
    }

  def renderPuzzleJson(slug: String): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case JsonFormat =>
          puzzlesLayoutProvider.getLayout().map { layout =>
            findPuzzleBySlug(layout.containers, slug)
              .filter(_.variant.contains("iframe-page"))
              .map { puzzle =>
                val page = StaticPages.dcrSimplePuzzleIframePage(request.path, puzzle.title)
                val dataModel =
                  DotcomPuzzleIframePageRenderingDataModel(page, puzzle, request)

                common
                  .renderJson(DotcomPuzzleIframePageRenderingDataModel.toJson(dataModel), page)
                  .as("application/json")
              }
              .getOrElse(NotFound)
          }

        case _ =>
          Future.successful(
            Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound)),
          )
      }
    }
}