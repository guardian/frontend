package controllers

import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common.GuLogging
import contentapi.ContentApiClient
import model.dotcomrendering.{PuzzleContainer, PuzzleItem, PuzzlesLayout}
import play.api.Environment
import play.api.libs.json.{JsError, JsSuccess, Json}
import views.support.CamelCase

import scala.concurrent.{ExecutionContext, Future, blocking}
import scala.util.control.NonFatal

import LocalJsonPuzzlesLayoutProvider.CrosswordDynamicFields

trait PuzzlesLayoutProvider {
  def getLayout()(implicit executionContext: ExecutionContext): Future[PuzzlesLayout]
}

class LocalJsonPuzzlesLayoutProvider(
    environment: Environment,
    contentApiClient: ContentApiClient,
    resourceName: String = LocalJsonPuzzlesLayoutProvider.DefaultResourceName,
) extends PuzzlesLayoutProvider
    with GuLogging {

  override def getLayout()(implicit executionContext: ExecutionContext): Future[PuzzlesLayout] =
    Future(blocking(loadLayout())).flatMap { baseLayout =>
      enrichCrosswordItems(baseLayout).recover { case NonFatal(error) =>
        log.warn("Failed to enrich puzzles layout with latest crosswords from CAPI using the base layout", error)
        baseLayout
      }
    }

  private def loadLayout(): PuzzlesLayout = {
    val inputStream = environment
      .resourceAsStream(resourceName)
      .getOrElse(
        throw new IllegalStateException(s"Puzzles layout resource '$resourceName' was not found on the classpath"),
      )

    try {
      Json.parse(inputStream).validate[PuzzlesLayout] match {
        case JsSuccess(layout, _) => layout
        case JsError(errors)      =>
          throw new IllegalArgumentException(
            s"Puzzles layout resource '$resourceName' is invalid: ${JsError.toJson(errors)}",
          )
      }
    } catch {
      case error: IllegalArgumentException => throw error
      case NonFatal(error)                 =>
        throw new IllegalArgumentException(
          s"Puzzles layout resource '$resourceName' could not be parsed as JSON",
          error,
        )
    } finally {
      inputStream.close()
    }
  }

  private def enrichCrosswordItems(layout: PuzzlesLayout)(implicit
      executionContext: ExecutionContext,
  ): Future[PuzzlesLayout] = {
    val crosswordSets = layout.containers
      .flatMap(crosswordItems)
      .filter(isLatestCrosswordCard)
      .map(_.set)
      .distinct

    Future
      .traverse(crosswordSets)(set => latestCrosswordForSet(set).map(set -> _))
      .map(_.collect { case (set, Some(dynamicFields)) => set -> dynamicFields }.toMap)
      .map { latestCrosswords =>
        layout.copy(containers = layout.containers.map(enrichContainer(_, latestCrosswords)))
      }
  }

  private def crosswordItems(container: PuzzleContainer): Seq[PuzzleItem] =
    container.content.items.flatten ++ container.content.nestedContainers.flatMap(crosswordItems)

  private def enrichContainer(
      container: PuzzleContainer,
      latestCrosswords: Map[String, CrosswordDynamicFields],
  ): PuzzleContainer =
    container.copy(content =
      container.content.copy(
        items = container.content.items.map(_.map(enrichItem(_, latestCrosswords))),
        nestedContainers = container.content.nestedContainers.map(enrichContainer(_, latestCrosswords)),
      ),
    )

  private def enrichItem(
      item: PuzzleItem,
      latestCrosswords: Map[String, CrosswordDynamicFields],
  ): PuzzleItem =
    if (isLatestCrosswordCard(item)) {
      latestCrosswords
        .get(item.set)
        .map(dynamicFields => item.copy(url = Some(dynamicFields.url), image = Some(dynamicFields.image)))
        .getOrElse(item)
    } else {
      item
    }

  private def isLatestCrosswordCard(item: PuzzleItem): Boolean =
    item.`type` == "crossword" && !item.variant.exists(_.startsWith("archive"))

  private def latestCrosswordForSet(set: String)(implicit
      executionContext: ExecutionContext,
  ): Future[Option[CrosswordDynamicFields]] =
    LocalJsonPuzzlesLayoutProvider.CrosswordSeriesTags
      .get(set)
      .fold(Future.successful(Option.empty[CrosswordDynamicFields])) { tag =>
        val query = SearchQuery()
          .contentType("crossword")
          .tag(tag)
          .useDate("newspaper-edition")
          .orderBy("newest")
          .pageSize(1)
          .showFields("all")

        contentApiClient
          .getResponse(query)
          .map(_.results.headOption.flatMap(toDynamicFields))
          .recover { case NonFatal(error) =>
            log.warn(s"Failed to fetch latest '$set' crossword from CAPI keeping its base layout values", error)
            None
          }
      }

  private def toDynamicFields(content: ApiContent): Option[CrosswordDynamicFields] =
    content.crossword.map { crossword =>
      val crosswordType = CamelCase.toHyphenated(crossword.`type`.name)
      val crosswordNumber = crossword.number

      CrosswordDynamicFields(
        url = s"/puzzles/crosswords/$crosswordType/$crosswordNumber",
        image = s"https://api.nextgen.guardianapps.co.uk/crosswords/$crosswordType/$crosswordNumber.svg",
      )
    }
}

object LocalJsonPuzzlesLayoutProvider {
  val DefaultResourceName = "puzzles-layout.json"

  private[controllers] val CrosswordSeriesTags: Map[String, String] = Map(
    "mini" -> "crosswords/series/mini-crossword",
    "weekend" -> "crosswords/series/weekend-crossword",
    "quick" -> "crosswords/series/quick",
    "cryptic" -> "crosswords/series/cryptic",
    "prize" -> "crosswords/series/prize",
    "sunday-quick" -> "crosswords/series/sunday-quick",
    "quick-cryptic" -> "crosswords/series/quick-cryptic",
    "everyman" -> "crosswords/series/everyman",
    "speedy" -> "crosswords/series/speedy",
    "quiptic" -> "crosswords/series/quiptic",
    "genius" -> "crosswords/series/genius",
    "special" -> "crosswords/series/special",
    "azed" -> "crosswords/series/azed",
  )

  private[controllers] case class CrosswordDynamicFields(url: String, image: String)
}
