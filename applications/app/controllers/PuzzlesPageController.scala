package controllers

import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.Content
import common.ImplicitControllerExecutionContext
import contentapi.ContentApiClient
import implicits.{HtmlFormat, JsonFormat}
import implicits.Requests.RichRequestHeader
import model.{ApplicationContext, CacheTime, Cached}
import model.dotcomrendering.{
  CrosswordArchiveEntry,
  CrosswordArchiveTab,
  DotcomCrosswordArchivePageRenderingDataModel,
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
    contentApiClient: ContentApiClient,
    wsClient: WSClient,
    puzzlesLayoutProvider: PuzzlesLayoutProvider,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext {

  private val remoteRenderer = DotcomRenderingService()
  private val archiveTypes = Seq("mini", "cryptic", "quick")

  private def normaliseArchiveType(request: RequestHeader): String =
    request.getQueryString("type").filter(archiveTypes.contains).getOrElse("mini")

  private def archiveTag(selectedType: String): String =
    selectedType match {
      case "mini"    => "crosswords/series/mini-crossword"
      case "cryptic" => "crosswords/series/cryptic"
      case "quick"   => "crosswords/series/quick"
      case _         => "crosswords/series/mini-crossword"
    }

  private def archiveTabs(selectedType: String): Seq[CrosswordArchiveTab] =
    archiveTypes.map { crosswordType =>
      CrosswordArchiveTab(
        label = crosswordType match {
          case "mini"    => "Today's Mini"
          case "cryptic" => "Today's Cryptic"
          case "quick"   => "Today's Quiptic"
          case other     => other
        },
        crosswordType = crosswordType,
        url = s"/puzzles/crosswords/archive?type=$crosswordType",
        isSelected = crosswordType == selectedType,
      )
    }

  private def archiveEntries(selectedType: String): Future[Seq[CrosswordArchiveEntry]] = {
    val query = SearchQuery()
      .contentType("crossword")
      .tag(archiveTag(selectedType))
      .useDate("newspaper-edition")
      .orderBy("newest")
      .pageSize(20)
      .showFields("all")

    contentApiClient.getResponse(query).map(_.results.toList.map(content => toArchiveEntry(content)))
  }

  private def toArchiveEntry(content: Content): CrosswordArchiveEntry =
    CrosswordArchiveEntry(
      title = content.webTitle,
      url = s"/puzzles/${content.id.stripPrefix("/")}",
      isLocked = true,
    )

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

  def renderCrosswordArchive(): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case HtmlFormat =>
          val selectedType = normaliseArchiveType(request)
          val page = StaticPages.dcrSimpleCrosswordArchivePage(request.path, selectedType)
          archiveEntries(selectedType).flatMap { entries =>
            val dataModel = DotcomCrosswordArchivePageRenderingDataModel(
              page,
              selectedType,
              archiveTabs(selectedType),
              entries,
              request,
            )

            remoteRenderer.getCrosswordArchivePage(
              wsClient,
              DotcomCrosswordArchivePageRenderingDataModel.toJson(dataModel),
            )
          }

        case _ =>
          Future.successful(
            Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound)),
          )
      }
    }

  def renderCrosswordArchiveJson(): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case JsonFormat =>
          val selectedType = normaliseArchiveType(request)
          val page = StaticPages.dcrSimpleCrosswordArchivePage(request.path, selectedType)
          archiveEntries(selectedType).map { entries =>
            val dataModel = DotcomCrosswordArchivePageRenderingDataModel(
              page,
              selectedType,
              archiveTabs(selectedType),
              entries,
              request,
            )

            common
              .renderJson(DotcomCrosswordArchivePageRenderingDataModel.toJson(dataModel), page)
              .as("application/json")
          }

        case _ =>
          Future.successful(
            Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound)),
          )
      }
    }
}
