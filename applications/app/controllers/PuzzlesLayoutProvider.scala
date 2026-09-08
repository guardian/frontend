package controllers

import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common.GuLogging
import contentapi.ContentApiClient
import model.dotcomrendering.{PuzzleContainer, PuzzleContent, PuzzleItem, PuzzlesLayout}
import play.api.Environment
import play.api.libs.json.{JsError, JsSuccess, Json}
import views.support.CamelCase

import java.time.{Clock, DayOfWeek, LocalDate, ZoneId}
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
    clock: Clock = Clock.systemUTC(),
) extends PuzzlesLayoutProvider
    with GuLogging {

  override def getLayout()(implicit executionContext: ExecutionContext): Future[PuzzlesLayout] =
    Future(blocking(loadLayout())).flatMap { baseLayout =>
      val scheduledLayout = applyFeaturedSchedule(baseLayout)
      enrichCrosswordItems(scheduledLayout).recover { case NonFatal(error) =>
        log.warn("Failed to enrich puzzles layout with latest crosswords from CAPI using the scheduled layout", error)
        scheduledLayout
      }
    }

  private def applyFeaturedSchedule(layout: PuzzlesLayout): PuzzlesLayout = {
    val day = LocalDate.now(clock.withZone(LocalJsonPuzzlesLayoutProvider.FeaturedScheduleZone)).getDayOfWeek
    layout.copy(containers = layout.containers.flatMap { container =>
      if (container.variant.contains("featured") && container.enabled.contains(false)) {
        None
      } else if (container.variant.contains("featured") && container.enabled.contains(true)) {
        Some(
          container.copy(content =
            PuzzleContent(Seq(LocalJsonPuzzlesLayoutProvider.featuredPuzzlesFor(day)), Seq.empty),
          ),
        )
      } else {
        Some(container)
      }
    })
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
        .map(dynamicFields =>
          item.copy(url = Some(dynamicFields.url), image = item.image.orElse(Some(dynamicFields.image))),
        )
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
  private val FeaturedScheduleZone: ZoneId = ZoneId.of("Europe/London")
  private val PreviewImage =
    "https://i.guim.co.uk/img/uploads/2023/11/01/SaturdayEdition_-_5-3.jpg?width=600&dpr=1&s=none&crop=5%3A3"

  private def featuredCrossword(id: String, title: String, set: String): PuzzleItem =
    PuzzleItem(
      id = s"featured-$id",
      title = title,
      `type` = "crossword",
      set = set,
      cardVariant = "large",
      cadence = Some("Daily"),
      backgroundColour = Some("#FCE1CE"),
    )

  private def featuredSudoku(id: String, title: String, set: String, amuseLabsSet: String): PuzzleItem =
    PuzzleItem(
      id = s"featured-$id",
      title = title,
      `type` = "sudoku",
      set = set,
      cardVariant = "large",
      cadence = Some("Daily"),
      url = Some(s"https://tg.amuselabs.com/guardian/date-picker?set=$amuseLabsSet&embed=1&idx=1"),
      image = Some(PreviewImage),
      slug = Some(id),
      index = Some(1),
      variant = Some("iframe-page"),
      backgroundColour = Some("#CDECFB"),
    )

  private val filmReveal = PuzzleItem(
    id = "featured-film-reveal",
    title = "Film reveal",
    `type` = "film-reveal",
    set = "all",
    cardVariant = "large",
    cadence = Some("Daily"),
    url = Some("https://moviegrid.io/guardian"),
    image = Some(PreviewImage),
    slug = Some("film-reveal"),
    variant = Some("iframe-page"),
    backgroundColour = Some("#EAD8B9"),
  )

  private val wordiply = PuzzleItem(
    id = "featured-wordiply",
    title = "Wordiply",
    `type` = "wordiply",
    set = "all",
    cardVariant = "large",
    cadence = Some("Daily"),
    url = Some("https://www.wordiply.com/"),
    image = Some("https://www.wordiply.com/share.png"),
    slug = Some("wordiply"),
    variant = Some("iframe-page"),
    backgroundColour = Some("#F8D0C9"),
  )

  private val onTheBall = PuzzleItem(
    id = "featured-on-the-ball",
    title = "On the ball",
    `type` = "on-the-ball",
    set = "all",
    cardVariant = "large",
    cadence = Some("Daily"),
    url = Some("https://sportsreveal.io/guardian"),
    image = Some(PreviewImage),
    slug = Some("on-the-ball"),
    variant = Some("iframe-page"),
    backgroundColour = Some("#D5F3F2"),
  )

  private[controllers] def featuredPuzzlesFor(day: DayOfWeek): Seq[PuzzleItem] = day match {
    case DayOfWeek.MONDAY =>
      Seq(
        featuredCrossword("crossword-quick", "Quick crossword", "quick"),
        featuredSudoku("sudoku-easy", "Easy sudoku", "easy", "guardian-sudoku-easy"),
      )
    case DayOfWeek.TUESDAY =>
      Seq(featuredCrossword("crossword-mini", "Mini crossword", "mini"), filmReveal)
    case DayOfWeek.WEDNESDAY =>
      Seq(
        featuredCrossword("crossword-cryptic", "Cryptic crossword", "cryptic"),
        featuredSudoku("sudoku-medium", "Medium sudoku", "medium", "guardian-sudoku-medium"),
      )
    case DayOfWeek.THURSDAY =>
      Seq(featuredCrossword("crossword-quick", "Quick crossword", "quick"), wordiply)
    case DayOfWeek.FRIDAY =>
      Seq(
        featuredCrossword("crossword-mini", "Mini crossword", "mini"),
        featuredSudoku("sudoku-hard", "Hard sudoku", "hard", "guardian-sudoku-hard"),
      )
    case DayOfWeek.SATURDAY =>
      Seq(featuredCrossword("crossword-weekend", "General knowledge crossword", "weekend"), filmReveal)
    case DayOfWeek.SUNDAY =>
      Seq(featuredCrossword("crossword-quiptic", "Quiptic crossword", "quiptic"), onTheBall)
  }

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
