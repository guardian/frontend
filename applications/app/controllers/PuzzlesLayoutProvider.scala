package controllers

import common.GuLogging
import model.dotcomrendering.{PuzzleContainer, PuzzleContent, PuzzleItem, PuzzlesLayout}
import play.api.Environment
import play.api.libs.json.{JsError, JsSuccess, Json}
import services.newsletters.NewsletterSignupAgent

import java.time.{Clock, DayOfWeek, LocalDate, ZoneId}
import scala.concurrent.{ExecutionContext, Future, blocking}
import scala.util.control.NonFatal

import LocalJsonPuzzlesLayoutProvider.CrosswordDynamicFields

trait PuzzlesLayoutProvider {
  def getLayout()(implicit executionContext: ExecutionContext): Future[PuzzlesLayout]
}

class LocalJsonPuzzlesLayoutProvider(
    environment: Environment,
    puzzlesArchiveApi: PuzzlesArchiveApi,
    newsletterSignupAgent: NewsletterSignupAgent,
    resourceName: String = LocalJsonPuzzlesLayoutProvider.DefaultResourceName,
    clock: Clock = Clock.systemUTC(),
) extends PuzzlesLayoutProvider
    with GuLogging {

  private val newsletters = new PuzzlesNewsletters(newsletterSignupAgent)

  override def getLayout()(implicit executionContext: ExecutionContext): Future[PuzzlesLayout] =
    Future(blocking(loadLayout())).flatMap { baseLayout =>
      val scheduledLayout = resolveNewsletters(applyFeaturedSchedule(baseLayout))
      val datedLayout = applyIframeDateFallback(scheduledLayout)
      enrichCrosswordItems(datedLayout).recover { case NonFatal(error) =>
        log.warn("Failed to enrich crossword cards from the Puzzles API using the scheduled layout", error)
        datedLayout
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

  // Play links need a date before hydration; bare game routes redirect to the archive.
  // Client-side API enrichment can still replace this with the latest publication date.
  private def applyIframeDateFallback(layout: PuzzlesLayout): PuzzlesLayout = {
    val today = LocalDate.now(clock.withZone(LocalJsonPuzzlesLayoutProvider.FeaturedScheduleZone)).toString
    layout.copy(containers = layout.containers.map(addIframeDate(_, today)))
  }

  private def addIframeDate(container: PuzzleContainer, date: String): PuzzleContainer =
    container.copy(content =
      container.content.copy(
        items = container.content.items.map(_.map { item =>
          if (item.variant.contains("iframe-page") && item.date.forall(_.trim.isEmpty))
            item.copy(date = Some(date))
          else item
        }),
        nestedContainers = container.content.nestedContainers.map(addIframeDate(_, date)),
      ),
    )

  private def resolveNewsletters(layout: PuzzlesLayout): PuzzlesLayout =
    layout.copy(containers = layout.containers.map { container =>
      container.copy(supporting = container.supporting.map { supporting =>
        supporting.newsletterIdentityName.fold(supporting) { identityName =>
          supporting.copy(newsletter = newsletters.live(identityName), newsletterIdentityName = None)
        }
      })
    })

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
      .filter(isPlayableCrosswordCard)
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
    if (isPlayableCrosswordCard(item)) {
      latestCrosswords
        .get(item.set)
        .map(dynamicFields =>
          item.copy(
            url = Some(dynamicFields.url),
            image = item.image.orElse(dynamicFields.image),
            imageAlt = item.imageAlt.orElse(Some(s"${item.title} illustration")),
            setter = dynamicFields.setter.orElse(item.setter),
          ),
        )
        .getOrElse(item)
    } else {
      item
    }

  private def isPlayableCrosswordCard(item: PuzzleItem): Boolean =
    item.`type` == "crossword" && !item.variant.exists(_.startsWith("archive"))

  private def latestCrosswordForSet(set: String)(implicit
      executionContext: ExecutionContext,
  ): Future[Option[CrosswordDynamicFields]] =
    PuzzlesArchiveBuilder
      .apiType("crossword", set)
      .fold(Future.successful(Option.empty[CrosswordDynamicFields])) { puzzleType =>
        val today = LocalDate.now(clock.withZone(LocalJsonPuzzlesLayoutProvider.FeaturedScheduleZone))
        puzzlesArchiveApi
          .get(today.minusDays(62), today, puzzleType)
          .map { items =>
            items
              .filter(_.puzzleType == puzzleType)
              .sortBy(_.publishDate)
              .reverse
              .flatMap { item =>
                item.gameUrl.filter(_.trim.nonEmpty).map { url =>
                  CrosswordDynamicFields(
                    url = url,
                    image =
                      if (set == "genius") None
                      else Some(s"https://api.nextgen.guardianapps.co.uk/crosswords/$set/${item.puzzleId}.svg"),
                    setter = item.setterName.map(_.trim).filter(_.nonEmpty),
                  )
                }
              }
              .headOption
          }
          .recover { case NonFatal(error) =>
            log.warn(
              s"Failed to fetch latest '$set' crossword from the Puzzles API keeping its base layout values",
              error,
            )
            None
          }
      }

}

object LocalJsonPuzzlesLayoutProvider {
  val DefaultResourceName = "puzzles-layout.json"
  private val FeaturedScheduleZone: ZoneId = ZoneId.of("Europe/London")

  private def puzzleArtwork(filename: String): String =
    s"https://i.guim.co.uk/img/uploads/2026/09/15/$filename.png?width=440&dpr=2&s=none"

  private def featuredCrossword(id: String, title: String, set: String): PuzzleItem = {
    val artworkSet = if (set == "weekend") "GENERAL-KNOWLEDGE" else set.toUpperCase(java.util.Locale.ROOT)
    PuzzleItem(
      id = s"featured-$id",
      title = title,
      `type` = "crossword",
      set = set,
      cardVariant = "large",
      image = Some(puzzleArtwork(s"crossword-$artworkSet")),
      imageAlt = Some(s"$title illustration"),
      backgroundColour = Some("#FCE1CE"),
    )
  }

  private def featuredSudoku(id: String, title: String, set: String, amuseLabsSet: String): PuzzleItem =
    PuzzleItem(
      id = s"featured-$id",
      title = title,
      `type` = "sudoku",
      set = set,
      cardVariant = "large",
      url = Some(s"https://tg.amuselabs.com/guardian/date-picker?set=$amuseLabsSet&embed=1&idx=1"),
      image = Some(puzzleArtwork(s"logic-puzzles-SUDOKU-${set.toUpperCase(java.util.Locale.ROOT)}")),
      imageAlt = Some(s"$title illustration"),
      slug = Some(s"logic-puzzles/$id"),
      index = Some(1),
      variant = Some("iframe-page"),
      backgroundColour = Some("#CDECFB"),
    )

  private val wordWheel = PuzzleItem(
    id = "featured-word-wheel",
    title = "Word wheel",
    `type` = "word-wheel",
    set = "all",
    cardVariant = "large",
    url = Some("https://tg.amuselabs.com/guardian/date-picker?set=guardian-word-wheel&embed=1&idx=1"),
    image = Some(puzzleArtwork("word-games-WORD-WHEEL")),
    imageAlt = Some("Word wheel illustration"),
    slug = Some("word-games/word-wheel"),
    index = Some(1),
    variant = Some("iframe-page"),
    backgroundColour = Some("#F9D4E8"),
  )

  private val wordiply = PuzzleItem(
    id = "featured-wordiply",
    title = "Wordiply",
    `type` = "wordiply",
    set = "all",
    cardVariant = "large",
    url = Some("https://www.wordiply.com/"),
    image = Some(puzzleArtwork("word-games-WORDIPLY")),
    imageAlt = Some("Wordiply illustration"),
    slug = Some("word-games/wordiply"),
    variant = Some("iframe-page"),
    backgroundColour = Some("#F8D0C9"),
  )

  private[controllers] def featuredPuzzlesFor(day: DayOfWeek): Seq[PuzzleItem] = day match {
    case DayOfWeek.MONDAY =>
      Seq(
        featuredCrossword("crossword-quick", "Quick crossword", "quick"),
        featuredSudoku("sudoku-easy", "Easy sudoku", "easy", "guardian-sudoku-easy"),
      )
    case DayOfWeek.TUESDAY =>
      Seq(featuredCrossword("crossword-mini", "Mini crossword", "mini"), wordWheel)
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
      Seq(
        featuredCrossword("crossword-weekend", "General knowledge crossword", "weekend"),
        featuredSudoku("sudoku-killer", "Killer sudoku", "killer", "guardian-killer-sudoku-medium"),
      )
    case DayOfWeek.SUNDAY =>
      Seq(featuredCrossword("crossword-quiptic", "Quiptic crossword", "quiptic"), wordWheel)
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

  private[controllers] case class CrosswordDynamicFields(url: String, image: Option[String], setter: Option[String])
}
