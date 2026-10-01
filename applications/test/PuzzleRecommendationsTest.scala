package test

import controllers.PuzzleRecommendations
import controllers.PuzzleRecommendations.{CrosswordLookup, LatestCrossword}
import model.dotcomrendering.PuzzleItem
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext, Future}

class PuzzleRecommendationsTest extends AnyFlatSpec with Matchers {
  private implicit val executionContext: ExecutionContext = ExecutionContext.global

  private val date = "2026-09-24"

  /** Every crossword set "has" crossword number 100, except when `exclude` matches the id we would return. */
  private val lookup: CrosswordLookup = (set, excludeId) => {
    val id = s"crosswords/$set/100"
    Future.successful(if (excludeId.contains(id)) Some(LatestCrossword(set, 99)) else Some(LatestCrossword(set, 100)))
  }

  private def resolve(key: String, id: Option[String] = None, l: CrosswordLookup = lookup): Seq[PuzzleItem] =
    Await.result(PuzzleRecommendations.resolve(key, id, date, l), 5.seconds)

  private def ids(items: Seq[PuzzleItem]): Seq[String] = items.map(_.id)

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

  "resolve" should "use the day before for the same iframe game and the same date for other iframe games" in {
    val items = resolve("sudoku-medium")
    items.flatMap(_.url) should contain allOf (
      "/puzzles-and-games/logic-puzzles/sudoku-medium/2026-09-23",
      "/puzzles-and-games/logic-puzzles/sudoku-hard/2026-09-24",
    )
    resolve("wordiply").find(_.id == "word-wheel").flatMap(_.url) shouldBe
      Some("/puzzles-and-games/word-games/word-wheel/2026-09-24")
  }

  it should "label the card of the same puzzle as previous and the others with their own cadence" in {
    val iframes = resolve("sudoku-medium")
    iframes.find(_.id == "sudoku-medium").flatMap(_.cadence) shouldBe Some("Yesterday")
    iframes.find(_.id == "sudoku-hard").flatMap(_.cadence) shouldBe Some("Today")

    val crosswords = resolve("weekend")
    crosswords.find(_.id == "crossword-weekend").flatMap(_.cadence) shouldBe Some("Previous")
    crosswords.find(_.id == "crossword-quick").flatMap(_.cadence) shouldBe Some("Today")
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

  it should "only resolve the quick crossword for the not yet built games" in {
    ids(resolve("on-the-ball")) shouldBe Seq("crossword-quick")
    ids(resolve("film-reveal")) shouldBe Seq("crossword-quick")
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
}
