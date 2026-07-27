package controllers

import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.Content
import common.ImplicitControllerExecutionContext
import contentapi.ContentApiClient
import implicits.{HtmlFormat, JsonFormat}
import implicits.Requests.RichRequestHeader
import model.{ApplicationContext, CacheTime, Cached, CrosswordData}
import model.dotcomrendering.{
  CrosswordArchiveEntry,
  CrosswordArchiveSection,
  DotcomCrosswordArchivePageRenderingDataModel,
  DotcomPuzzleIframePageRenderingDataModel,
  DotcomPuzzlesPageRenderingDataModel,
  PuzzleArchiveNavigation,
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
  private case class ArchiveSeries(
      title: String,
      cadence: String,
      crosswordType: String,
      tag: String,
      moreUrl: String,
  )

  private val archiveSeries = Seq(
    ArchiveSeries("Mini", "Daily", "mini", "crosswords/series/mini-crossword", "/crosswords/series/mini-crossword"),
    ArchiveSeries("Quick", "Daily", "quick", "crosswords/series/quick", "/crosswords/series/quick"),
    ArchiveSeries("Cryptic", "Daily", "cryptic", "crosswords/series/cryptic", "/crosswords/series/cryptic"),
    ArchiveSeries(
      "Quick cryptic",
      "Weekly",
      "quick-cryptic",
      "crosswords/series/quick-cryptic",
      "/crosswords/series/quick-cryptic",
    ),
    ArchiveSeries("Quiptic", "Weekly", "quiptic", "crosswords/series/quiptic", "/crosswords/series/quiptic"),
    ArchiveSeries("Prize", "Weekly", "prize", "crosswords/series/prize", "/crosswords/series/prize"),
    ArchiveSeries(
      "Weekend",
      "Weekly",
      "weekend",
      "crosswords/series/weekend-crossword",
      "/crosswords/series/weekend-crossword",
    ),
    ArchiveSeries(
      "Sunday quick",
      "Weekly",
      "sunday-quick",
      "crosswords/series/sunday-quick",
      "/crosswords/series/sunday-quick",
    ),
  )

  private def archiveSection(series: ArchiveSeries): Future[CrosswordArchiveSection] = {
    val query = SearchQuery()
      .contentType("crossword")
      .tag(series.tag)
      .useDate("newspaper-edition")
      .orderBy("newest")
      .pageSize(4)
      .showFields("all")

    contentApiClient.getResponse(query).map { response =>
      CrosswordArchiveSection(
        title = series.title,
        cadence = series.cadence,
        crosswordType = series.crosswordType,
        moreUrl = series.moreUrl,
        entries = response.results.toList.flatMap(toArchiveEntry).take(4),
      )
    }
  }

  private def archiveSections(): Future[Seq[CrosswordArchiveSection]] =
    Future.traverse(archiveSeries)(archiveSection)

  private def toArchiveEntry(content: Content): Option[CrosswordArchiveEntry] =
    content.crossword.map { crossword =>
      val crosswordData = CrosswordData.fromCrossword(crossword, content)

      CrosswordArchiveEntry(
        date = crosswordData.date.toString("yyyy-MM-dd"),
        url = s"/puzzles/${crosswordData.id}",
      )
    }

  private def findPuzzleBySlug(
      containers: Seq[PuzzleContainer],
      slug: String,
  ): Option[PuzzleItem] = {
    containers.iterator
      .flatMap { container =>
        container.content.items.flatten.iterator ++
          container.content.archive.iterator ++
          findPuzzleBySlug(container.content.nestedContainers, slug).iterator
      }
      .find(_.slug.contains(slug))
  }

  private case class PuzzleArchivePage(
      title: String,
      puzzle: PuzzleItem,
  )

  private def puzzleArchivePages(
      containers: Seq[PuzzleContainer],
  ): Seq[PuzzleArchivePage] =
    containers.flatMap { container =>
      val archivePage = container.content.archive
        .filter(_.variant.contains("archive-page"))
        .flatMap { archive =>
          archive.slug.map(_ => PuzzleArchivePage(container.title, archive))
        }

      archivePage.toSeq ++ puzzleArchivePages(container.content.nestedContainers)
    }

  private def archiveNavigation(
      pages: Seq[PuzzleArchivePage],
  ): Seq[PuzzleArchiveNavigation] =
    pages.flatMap { page =>
      page.puzzle.slug.map { slug =>
        PuzzleArchiveNavigation(page.title, s"/puzzles/$slug/archive")
      }
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

  private val PuzzleArchiveMonthPath =
    """.*/archive/(\d{4})/(0[1-9]|1[0-2])(?:\.json)?$""".r

  private def archiveMonthFromPath(path: String): Option[String] =
    path match {
      case PuzzleArchiveMonthPath(year, month) => Some(s"$year-$month")
      case _                                   => None
    }

  def renderPuzzleArchive(slug: String): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case HtmlFormat =>
          puzzlesLayoutProvider.getLayout().flatMap { layout =>
            val pages = puzzleArchivePages(layout.containers)
            pages
              .find(_.puzzle.slug.contains(slug))
              .map { archive =>
                val page =
                  StaticPages.dcrSimplePuzzleArchivePage(request.path, archive.title)
                val dataModel = DotcomPuzzleIframePageRenderingDataModel(
                  page,
                  archive.puzzle,
                  request,
                  archiveNavigation(pages),
                  archiveMonthFromPath(request.path),
                )

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

  def renderPuzzleArchiveJson(slug: String): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case JsonFormat =>
          puzzlesLayoutProvider.getLayout().map { layout =>
            val pages = puzzleArchivePages(layout.containers)
            pages
              .find(_.puzzle.slug.contains(slug))
              .map { archive =>
                val page =
                  StaticPages.dcrSimplePuzzleArchivePage(request.path, archive.title)
                val dataModel = DotcomPuzzleIframePageRenderingDataModel(
                  page,
                  archive.puzzle,
                  request,
                  archiveNavigation(pages),
                  archiveMonthFromPath(request.path),
                )

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

  private def validArchiveMonth(year: Int, month: Int): Option[String] =
    Option.when(year >= 1970 && year <= 9999 && month >= 1 && month <= 12)(
      f"$year%04d-$month%02d",
    )

  def renderPuzzleArchiveMonth(
      slug: String,
      year: Int,
      month: Int,
  ): Action[AnyContent] =
    validArchiveMonth(year, month)
      .map(_ => renderPuzzleArchive(slug))
      .getOrElse(Action(NotFound))

  def renderPuzzleArchiveMonthJson(
      slug: String,
      year: Int,
      month: Int,
  ): Action[AnyContent] =
    validArchiveMonth(year, month)
      .map(_ => renderPuzzleArchiveJson(slug))
      .getOrElse(Action(NotFound))

  def renderCrosswordArchive(): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case HtmlFormat =>
          val page = StaticPages.dcrSimpleCrosswordArchivePage(request.path)
          archiveSections().flatMap { sections =>
            val dataModel = DotcomCrosswordArchivePageRenderingDataModel(
              page,
              sections,
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
          val page = StaticPages.dcrSimpleCrosswordArchivePage(request.path)
          archiveSections().map { sections =>
            val dataModel = DotcomCrosswordArchivePageRenderingDataModel(
              page,
              sections,
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
