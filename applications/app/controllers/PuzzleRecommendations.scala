package controllers

import com.gu.contentapi.client.model.SearchQuery
import contentapi.ContentApiClient
import common.GuLogging
import model.dotcomrendering.PuzzleItem
import views.support.CamelCase

import java.text.NumberFormat
import java.time.LocalDate
import java.util.Locale
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try
import scala.util.control.NonFatal

/** Table-driven "More from Puzzles & games" recommendations, shared by every page that shows the rail.
  *
  * The table is keyed by the puzzle being played and lists the (up to) 3 puzzles to recommend, in slot order. A key
  * that equals the row's own key means "most recent of the same puzzle, excluding the current one". Resolution depends
  * on the kind of puzzle referenced:
  *   - crossword: the most recent crossword of that series, found via CAPI (never the current article)
  *   - iframe game (sudoku, word wheel, wordiply): date arithmetic, no CAPI. Same puzzle => the day before `date`, any
  *     other puzzle => the same `date`.
  *
  * A key without a catalogue entry (e.g. `on-the-ball` and `film-reveal`, which are not built yet) is simply left out
  * of the result, so the rail shows fewer cards rather than failing.
  */
object PuzzleRecommendations extends GuLogging {

  /** Static card metadata for a recommendable puzzle. */
  private sealed trait Card {
    def key: String
    def title: String
    def backgroundColour: String
  }

  private case class CrosswordCard(
      key: String,
      title: String,
  ) extends Card {
    val backgroundColour = "#FCE1CE"
  }

  private case class IframeCard(
      key: String,
      title: String,
      `type`: String,
      set: String,
      group: String,
      backgroundColour: String,
  ) extends Card {
    val cadence = "Today"
  }

  /** Cadence of an iframe card pointing at the previous instance of the puzzle being played, instead of the current
    * one. Crossword cards have no cadence: they are identified by their number (see [[crosswordItem]]).
    */
  private val PreviousIframeCadence = "Yesterday"

  val LogicPuzzlesGroup = "logic-puzzles"
  val WordGamesGroup = "word-games"

  private val crosswordCards: Seq[CrosswordCard] = Seq(
    CrosswordCard("quick", "Quick crossword"),
    CrosswordCard("mini", "Mini crossword"),
    CrosswordCard("cryptic", "Cryptic crossword"),
    CrosswordCard("quick-cryptic", "Quick cryptic crossword"),
    CrosswordCard("weekend", "Weekend crossword"),
    CrosswordCard("prize", "Prize crossword"),
    CrosswordCard("quiptic", "Quiptic crossword"),
    CrosswordCard("genius", "Genius crossword"),
    CrosswordCard("sunday-quick", "Sunday quick crossword"),
    CrosswordCard("special", "Special crossword"),
  )

  private val iframeCards: Seq[IframeCard] = Seq(
    IframeCard("sudoku-easy", "Easy sudoku", "sudoku", "easy", LogicPuzzlesGroup, "#CDECFB"),
    IframeCard("sudoku-medium", "Medium sudoku", "sudoku", "medium", LogicPuzzlesGroup, "#CDECFB"),
    IframeCard("sudoku-hard", "Hard sudoku", "sudoku", "hard", LogicPuzzlesGroup, "#CDECFB"),
    IframeCard("sudoku-killer", "Killer sudoku", "sudoku", "killer", LogicPuzzlesGroup, "#CDECFB"),
    IframeCard("word-wheel", "Word wheel", "word-wheel", "all", WordGamesGroup, "#F9D4E8"),
    IframeCard("wordiply", "Wordiply", "wordiply", "all", WordGamesGroup, "#F8D0C9"),
  )

  private val crosswordCatalogue: Map[String, CrosswordCard] = crosswordCards.map(c => c.key -> c).toMap
  private val iframeCatalogue: Map[String, IframeCard] = iframeCards.map(c => c.key -> c).toMap

  /** The design table: puzzle being played -> the 3 puzzles to recommend, in slot order. A key equal to the row's own
    * key means "most recent, excluding the current one".
    */
  val Table: Map[String, Seq[String]] = Map(
    "mini" -> Seq("mini", "quick", "cryptic"),
    "quick" -> Seq("quick", "mini", "cryptic"),
    "cryptic" -> Seq("cryptic", "quick", "quick-cryptic"),
    "quick-cryptic" -> Seq("quick-cryptic", "cryptic", "quick"),
    "weekend" -> Seq("weekend", "quick", "mini"),
    "prize" -> Seq("cryptic", "quick-cryptic", "quick"),
    "quiptic" -> Seq("cryptic", "quick-cryptic", "quick"),
    "genius" -> Seq("cryptic", "quick-cryptic", "quick"),
    "special" -> Seq("cryptic", "quick-cryptic", "quick"),
    "sunday-quick" -> Seq("quick", "mini", "cryptic"),
    "word-wheel" -> Seq("word-wheel", "quick", "mini"),
    "wordiply" -> Seq("mini", "word-wheel", "sudoku-easy"),
    "sudoku-easy" -> Seq("sudoku-easy", "sudoku-medium", "mini"),
    "sudoku-medium" -> Seq("sudoku-medium", "sudoku-hard", "quick"),
    "sudoku-hard" -> Seq("sudoku-hard", "sudoku-medium", "quick"),
    "sudoku-killer" -> Seq("sudoku-killer", "sudoku-hard", "sudoku-medium"),
    // Not built yet: their own/each other's cards have no catalogue entry, so only "quick" resolves for now.
    "on-the-ball" -> Seq("on-the-ball", "film-reveal", "quick"),
    "film-reveal" -> Seq("film-reveal", "on-the-ball", "quick"),
  )

  /** Used for any puzzle without a row in [[Table]] (e.g. everyman, speedy, azed): one puzzle from each group. */
  val Default: Seq[String] = Seq("quick", "sudoku-easy", "word-wheel")

  /** Most recent crossword of a series, as needed to build a card. */
  case class LatestCrossword(crosswordType: String, number: Int)

  /** Looks up the most recent crossword of `set`, ignoring the article whose CAPI id is `excludeId`. */
  type CrosswordLookup = (String, Option[String]) => Future[Option[LatestCrossword]]

  /** The recommendations for the puzzle `currentKey`, with the current crossword article id (if the current page is a
    * crossword) and the `date` (yyyy-MM-dd) of the current page. Always succeeds: anything that cannot be resolved is
    * left out.
    */
  def resolve(currentKey: String, currentId: Option[String], date: String, lookup: CrosswordLookup)(implicit
      ec: ExecutionContext,
  ): Future[Seq[PuzzleItem]] = {
    val keys = keysFor(currentKey)
    Future.sequence(keys.map(key => resolveSlot(key, currentKey, currentId, date, lookup))).map(_.flatten)
  }

  /** The [[CrosswordLookup]] backed by CAPI. Failures are logged and degrade to "no card". */
  def capiLookup(contentApiClient: ContentApiClient)(implicit ec: ExecutionContext): CrosswordLookup =
    (set, excludeId) =>
      LocalJsonPuzzlesLayoutProvider.CrosswordSeriesTags
        .get(set)
        .fold(Future.successful(Option.empty[LatestCrossword])) { tag =>
          // Fetch 2 so the current article can be skipped when it is itself the newest of its series.
          val query = SearchQuery()
            .contentType("crossword")
            .tag(tag)
            .useDate("newspaper-edition")
            .orderBy("newest")
            .pageSize(2)
            .showFields("all")

          contentApiClient
            .getResponse(query)
            .map { response =>
              response.results
                .filterNot(content => excludeId.contains(content.id))
                .flatMap(_.crossword)
                .headOption
                .map(crossword => LatestCrossword(CamelCase.toHyphenated(crossword.`type`.name), crossword.number))
            }
            .recover { case NonFatal(error) =>
              log.warn(s"Failed to fetch latest '$set' crossword for puzzle recommendations", error)
              None
            }
        }

  private[controllers] def keysFor(currentKey: String): Seq[String] =
    Table.getOrElse(currentKey, Default.filterNot(_ == currentKey))

  private def resolveSlot(
      key: String,
      currentKey: String,
      currentId: Option[String],
      date: String,
      lookup: CrosswordLookup,
  )(implicit ec: ExecutionContext): Future[Option[PuzzleItem]] =
    (crosswordCatalogue.get(key), iframeCatalogue.get(key)) match {
      case (Some(card), _) =>
        lookup(card.key, currentId)
          .map(_.map(latest => crosswordItem(card, latest)))
          .recover { case NonFatal(_) => None }
      case (_, Some(card)) =>
        val isPrevious = key == currentKey
        val targetDate = if (isPrevious) previousDay(date) else Some(date)
        Future.successful(targetDate.map(iframeItem(card, _, isPrevious)))
      case _ => Future.successful(None)
    }

  private def previousDay(date: String): Option[String] =
    Try(LocalDate.parse(date).minusDays(1).toString).toOption

  /** Crosswords are numbered, not dated, and the card links to the most recent one, so it is labelled with that number
    * (e.g. "No 17,599") rather than with a day.
    */
  private def crosswordItem(card: CrosswordCard, latest: LatestCrossword): PuzzleItem =
    PuzzleItem(
      id = s"crossword-${card.key}",
      title = card.title,
      `type` = "crossword",
      set = card.key,
      cardVariant = "compact",
      cadence = Some(s"No ${NumberFormat.getIntegerInstance(Locale.UK).format(latest.number)}"),
      url = Some(s"/crosswords/${latest.crosswordType}/${latest.number}"),
      backgroundColour = Some(card.backgroundColour),
    )

  private def iframeItem(card: IframeCard, date: String, isPrevious: Boolean): PuzzleItem =
    PuzzleItem(
      id = card.key,
      title = card.title,
      `type` = card.`type`,
      set = card.set,
      cardVariant = "compact",
      cadence = Some(if (isPrevious) PreviousIframeCadence else card.cadence),
      url = Some(s"/puzzles-and-games/${card.group}/${card.key}/$date"),
      backgroundColour = Some(card.backgroundColour),
    )
}
