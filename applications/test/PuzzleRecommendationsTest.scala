package test

import controllers.{PuzzlesApiItem, PuzzlesArchiveApi, PuzzleRecommendations}
import controllers.PuzzleRecommendations.{CrosswordLookup, LatestCrossword}
import model.dotcomrendering.PuzzleItem
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDate
import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext, Future}

class PuzzleRecommendationsTest extends AnyFlatSpec with Matchers {
  private implicit val executionContext: ExecutionContext = ExecutionContext.global

  private val date = "2026-09-24"
  private val today = LocalDate.parse(date)

  /** Every crossword set "has" crossword number 100 (published today), except when `exclude` matches the id we would
    * return: then the previous one, number 99 (published the day before).
    */
  private val lookup: CrosswordLookup = (set, excludeId) => {
    val id = s"crosswords/$set/100"
    Future.successful(
      if (excludeId.contains(id)) Some(LatestCrossword(set, 99, Some(today.minusDays(1))))
      else Some(LatestCrossword(set, 100, Some(today))),
    )
  }

  private def resolve(
      key: String,
      id: Option[String] = None,
      l: CrosswordLookup = lookup,
      includeV2Games: Boolean = false,
  ): Seq[PuzzleItem] =
    Await.result(PuzzleRecommendations.resolve(key, id, date, l, today, includeV2Games), 5.seconds)

  private def ids(items: Seq[PuzzleItem]): Seq[String] = items.map(_.id)

  "API recommendations" should "preserve the latest destination and omit unavailable crossword links" in {
    val api = new PuzzlesArchiveApi {
      override def get(start: LocalDate, end: LocalDate, puzzleType: String, authorization: Option[String])(implicit
          ec: ExecutionContext,
      ): Future[Seq[PuzzlesApiItem]] =
        Future.successful(
          if (puzzleType == "CROSSWORD_QUICK")
            Seq(
              PuzzlesApiItem("old", puzzleType, "2026-09-23", 0, None, Some("/old")),
              PuzzlesApiItem(
                "opaque",
                puzzleType,
                date,
                0,
                None,
                Some("https://www.theguardian.com/crosswords/quick/123?source=api"),
              ),
            )
          else Seq(PuzzlesApiItem("unavailable", puzzleType, date, 0, None, None)),
        )
    }
    val items = resolve("word-wheel", l = PuzzleRecommendations.apiLookup(api))
    items.map(_.id) shouldBe Seq("word-wheel", "crossword-quick")
    items.last.url shouldBe Some("https://www.theguardian.com/crosswords/quick/123?source=api")
    items.last.date shouldBe Some(date)
  }

  "Table" should "have the 18 rows of the design table, each with 3 slots" in {
    PuzzleRecommendations.Table.keySet shouldBe Set(
      "mini",
      "quick",
      "cryptic",
      "quick-cryptic",
      "weekend",
      "prize",
      "quiptic",
      "genius",
      "special",
      "sunday-quick",
      "word-wheel",
      "wordiply",
      "sudoku-easy",
      "sudoku-medium",
      "sudoku-hard",
      "sudoku-killer",
      "on-the-ball",
      "film-reveal",
    )
    all(PuzzleRecommendations.Table.values.map(_.size)) shouldBe 3
  }

  it should "resolve the slots of the crossword rows, in order" in {
    ids(resolve("mini")) shouldBe Seq("crossword-mini", "crossword-quick", "crossword-cryptic")
    ids(resolve("quick-cryptic")) shouldBe Seq("crossword-quick-cryptic", "crossword-cryptic", "crossword-quick")
    ids(resolve("weekend")) shouldBe Seq("crossword-weekend", "crossword-quick", "crossword-mini")
    for (key <- Seq("prize", "quiptic", "genius", "special"))
      ids(resolve(key)) shouldBe Seq("crossword-cryptic", "crossword-quick-cryptic", "crossword-quick")
    ids(resolve("sunday-quick")) shouldBe Seq("crossword-quick", "crossword-mini", "crossword-cryptic")
  }

  it should "resolve the slots of the iframe game rows, in order" in {
    ids(resolve("word-wheel")) shouldBe Seq("word-wheel", "crossword-quick", "crossword-mini")
    ids(resolve("wordiply")) shouldBe Seq("crossword-mini", "word-wheel", "sudoku-easy")
    ids(resolve("sudoku-easy")) shouldBe Seq("sudoku-easy", "sudoku-medium", "crossword-mini")
    ids(resolve("sudoku-medium")) shouldBe Seq("sudoku-medium", "sudoku-hard", "crossword-quick")
    ids(resolve("sudoku-hard")) shouldBe Seq("sudoku-hard", "sudoku-medium", "crossword-quick")
    ids(resolve("sudoku-killer")) shouldBe Seq("sudoku-killer", "sudoku-hard", "sudoku-medium")
  }

  "resolve" should "use the day before for the iframe game being played today and today for every other iframe game" in {
    val items = resolve("sudoku-medium")
    items.flatMap(_.url) should contain allOf (
      "/puzzles-and-games/logic-puzzles/sudoku-medium/2026-09-23",
      "/puzzles-and-games/logic-puzzles/sudoku-hard/2026-09-24",
    )
    resolve("wordiply").find(_.id == "word-wheel").flatMap(_.url) shouldBe
      Some("/puzzles-and-games/word-games/word-wheel/2026-09-24")
  }

  it should "point every iframe game at today when the page being played is not today's, including the one being played" in {
    val pastPage = "2026-09-10"
    val items = Await.result(
      PuzzleRecommendations.resolve("sudoku-easy", None, pastPage, lookup, today),
      5.seconds,
    )
    items.find(_.id == "sudoku-easy").flatMap(_.url) shouldBe
      Some("/puzzles-and-games/logic-puzzles/sudoku-easy/2026-09-24")
    items.find(_.id == "sudoku-easy").flatMap(_.cadence) shouldBe Some("Today")
    items.find(_.id == "sudoku-medium").flatMap(_.url) shouldBe
      Some("/puzzles-and-games/logic-puzzles/sudoku-medium/2026-09-24")
    items.find(_.id == "sudoku-medium").flatMap(_.cadence) shouldBe Some("Today")
  }

  it should "label every card with Today or its short date, never Yesterday or a crossword number" in {
    val iframes = resolve("sudoku-medium")
    iframes.find(_.id == "sudoku-medium").flatMap(_.cadence) shouldBe Some("Wed 23 Sep")
    iframes.find(_.id == "sudoku-hard").flatMap(_.cadence) shouldBe Some("Today")

    val crosswords = resolve("weekend", Some("crosswords/weekend/100"))
    crosswords.find(_.id == "crossword-weekend").flatMap(_.cadence) shouldBe Some("Wed 23 Sep")
    crosswords.find(_.id == "crossword-quick").flatMap(_.cadence) shouldBe Some("Today")
  }

  it should "label a card relative to the current day in London, not the page's date" in {
    val items = Await.result(
      PuzzleRecommendations.resolve("sudoku-easy", None, date, lookup, today.plusDays(10)),
      5.seconds,
    )
    // Both games are today's (the page is not), the crossword is the one published on the page's day.
    items.flatMap(_.cadence) shouldBe Seq("Today", "Today", "Thu 24 Sep")
  }

  it should "format a crossword's date as the short date, with no trailing number" in {
    val saturday: CrosswordLookup =
      (set, _) => Future.successful(Some(LatestCrossword(set, 17599, Some(LocalDate.parse("2026-10-10")))))
    resolve("quick", l = saturday).head.cadence shouldBe Some("Sat 10 Oct")
    resolve("quick", l = saturday).head.date shouldBe Some("2026-10-10")
  }

  it should "have no label for a crossword whose date is unknown, rather than a wrong one" in {
    val undated: CrosswordLookup = (set, _) => Future.successful(Some(LatestCrossword(set, 17599)))
    resolve("quick", l = undated).head.cadence shouldBe None
  }

  it should "give every iframe card its date" in {
    resolve("sudoku-medium").filter(_.`type` == "sudoku").map(_.date) shouldBe
      Seq(Some("2026-09-23"), Some("2026-09-24"))
  }

  it should "link crosswords to their most recent puzzle" in {
    resolve("quick").map(_.url.get) shouldBe Seq(
      "/crosswords/quick/100",
      "/crosswords/mini/100",
      "/crosswords/cryptic/100",
    )
  }

  it should "pass the current article id to the lookup so it can be excluded" in {
    val items = resolve("quick", Some("crosswords/quick/100"))
    items.head.url shouldBe Some("/crosswords/quick/99")
  }

  it should "leave out cards it cannot resolve when CAPI has nothing or fails" in {
    val failing: CrosswordLookup =
      (set, _) => if (set == "mini") Future.failed(new RuntimeException("boom")) else Future.successful(None)
    resolve("mini", l = failing) shouldBe empty
    resolve("sudoku-easy", l = failing).map(_.id) shouldBe Seq("sudoku-easy", "sudoku-medium")
  }

  it should "resolve MovieGrid recommendations to dated public pages, not provider URLs" in {
    ids(resolve("on-the-ball", includeV2Games = true)) shouldBe Seq("on-the-ball", "film-reveal", "crossword-quick")
    ids(resolve("film-reveal", includeV2Games = true)) shouldBe Seq("film-reveal", "on-the-ball", "crossword-quick")
    val cards = resolve("film-reveal", includeV2Games = true).take(2)
    cards.map(_.url) shouldBe Seq(
      Some("/puzzles-and-games/trivia-and-quizzes/film-reveal/2026-09-23"),
      Some("/puzzles-and-games/trivia-and-quizzes/on-the-ball/2026-09-24"),
    )
    cards.map(_.`type`) shouldBe Seq("film-reveal", "on-the-ball")
    all(cards.map(_.set)) shouldBe "all"
    cards.flatMap(_.image) shouldBe empty
  }

  it should "recommend one puzzle of each group for a puzzle without a row" in {
    val items = resolve("everyman")
    ids(items) shouldBe Seq("crossword-quick", "sudoku-easy", "word-wheel")
  }

  it should "build valid puzzle cards" in {
    val items = resolve("sudoku-easy")
    all(items.map(_.cardVariant)) shouldBe "compact"
    all(items.flatMap(_.cadence)) should not be empty
    items.foreach(item => item.id should fullyMatch regex "[a-z0-9]+(?:-[a-z0-9]+)*")
  }

  private def resolveArchive(
      key: String,
      l: CrosswordLookup = lookup,
      includeV2Games: Boolean = false,
  ): Seq[PuzzleItem] =
    Await.result(PuzzleRecommendations.resolveForArchive(key, date, l, today, includeV2Games), 5.seconds)

  "V1 recommendations" should "omit MovieGrid cards unless explicitly enabled by the request" in {
    Seq("film-reveal", "on-the-ball").foreach { key =>
      ids(resolve(key)) shouldBe Seq("crossword-quick")
      ids(resolveArchive(key)) shouldBe Seq("crossword-quick", "sudoku-medium")
    }
    PuzzleRecommendations.Table.keys.filterNot(Set("film-reveal", "on-the-ball")).foreach { key =>
      resolve(key) shouldBe resolve(key, includeV2Games = true)
      resolveArchive(key) shouldBe resolveArchive(key, includeV2Games = true)
    }
  }

  "ArchiveTable" should "have the same 18 rows as the puzzle table, each with 3 slots and never its own puzzle" in {
    PuzzleRecommendations.ArchiveTable.keySet shouldBe PuzzleRecommendations.Table.keySet
    all(PuzzleRecommendations.ArchiveTable.values.map(_.size)) shouldBe 3
    PuzzleRecommendations.ArchiveTable.foreach { case (key, slots) => slots should not contain key }
  }

  it should "resolve the slots of the archive rows, in order" in {
    ids(resolveArchive("mini")) shouldBe Seq("crossword-quick", "crossword-cryptic", "crossword-quick-cryptic")
    ids(resolveArchive("quick-cryptic")) shouldBe Seq("crossword-cryptic", "crossword-quick", "crossword-mini")
    ids(resolveArchive("weekend")) shouldBe Seq("crossword-quick", "crossword-cryptic", "crossword-mini")
    ids(resolveArchive("word-wheel")) shouldBe Seq("crossword-mini", "crossword-quick", "sudoku-easy")
    ids(resolveArchive("wordiply")) shouldBe Seq("word-wheel", "crossword-quick", "sudoku-medium")
    ids(resolveArchive("sudoku-easy")) shouldBe Seq("sudoku-medium", "sudoku-hard", "crossword-quick")
    ids(resolveArchive("sudoku-hard")) shouldBe Seq("sudoku-medium", "sudoku-killer", "crossword-quick")
    ids(resolveArchive("on-the-ball", includeV2Games = true)) shouldBe Seq(
      "film-reveal",
      "crossword-quick",
      "sudoku-medium",
    )
    ids(resolveArchive("film-reveal", includeV2Games = true)) shouldBe Seq(
      "on-the-ball",
      "crossword-quick",
      "sudoku-medium",
    )
  }

  it should "label every iframe card as today (the archive's own day) and fall back to the default for an unlisted puzzle" in {
    resolveArchive("sudoku-easy").filter(_.`type` == "sudoku").flatMap(_.cadence).distinct shouldBe Seq("Today")
    ids(resolveArchive("everyman")) shouldBe Seq("crossword-quick", "sudoku-easy", "word-wheel")
  }
}
