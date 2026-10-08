package test

import controllers.{PuzzlesApiItem, PuzzlesApiResponse, PuzzlesArchiveBuilder}
import model.dotcomrendering.{PuzzleContainer, PuzzleContent, PuzzleItem, PuzzlesLayout}
import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.Json

@DoNotDiscover class PuzzlesArchiveBuilderTest extends AnyFlatSpec with Matchers {
  private val quick = PuzzleItem("archive-quick", "Quick", "crossword", "quick", "archive")
  private val mini = PuzzleItem("archive-mini", "Mini", "crossword", "mini", "archive")
  private val weekend = PuzzleItem("archive-weekend", "Weekend", "crossword", "weekend", "archive")
  private val sudoku = PuzzleItem(
    "sudoku-easy",
    "Easy sudoku",
    "sudoku",
    "easy",
    "primary",
    slug = Some("logic-puzzles/sudoku-easy"),
  )
  private val wordWheel = PuzzleItem(
    "word-wheel",
    "Word wheel",
    "word-wheel",
    "all",
    "primary",
    slug = Some("word-games/word-wheel"),
  )
  private val wordiply = PuzzleItem(
    "wordiply",
    "Wordiply",
    "wordiply",
    "all",
    "primary",
    slug = Some("word-games/wordiply"),
  )
  private val layout = PuzzlesLayout(
    Seq(
      PuzzleContainer(
        "crosswords",
        "Crosswords",
        Some("standard"),
        PuzzleContent(Nil, Nil, archiveChoices = Some(Seq(quick, mini, weekend))),
      ),
      PuzzleContainer("logic-puzzles", "Logic puzzles", Some("standard"), PuzzleContent(Seq(Seq(sudoku)), Nil)),
      PuzzleContainer(
        "word-games",
        "Word games",
        Some("standard"),
        PuzzleContent(Seq(Seq(wordWheel, wordiply)), Nil),
      ),
    ),
  )

  "PuzzlesArchiveBuilder" should "derive the category and puzzle selection from the layout" in {
    val selection = PuzzlesArchiveBuilder.select(layout, "logic-puzzles", Some("sudoku-easy")).get
    selection.category should be("logic-puzzles")
    selection.apiType should be("SUDOKU_EASY")
  }

  it should "use an archive item's exact date in its puzzle page destination" in {
    val selection = PuzzlesArchiveBuilder.select(layout, "logic-puzzles", None).get
    val destination = PuzzlesArchiveBuilder.destination(
      selection,
      PuzzlesApiItem("guardian-sudoku-20260902", "SUDOKU_EASY", "2026-09-02T00:00:00Z", 0, None, None),
    )
    destination should be("/puzzles-and-games/logic-puzzles/sudoku-easy/2026-09-02")
  }

  it should "build canonical crossword destinations instead of using the API game URL" in {
    val miniSelection = PuzzlesArchiveBuilder.select(layout, "crosswords", Some("mini")).get
    val weekendSelection = PuzzlesArchiveBuilder.select(layout, "crosswords", Some("weekend")).get

    PuzzlesArchiveBuilder.destination(
      miniSelection,
      PuzzlesApiItem(
        "287",
        "CROSSWORD_MINI",
        "2026-09-30T00:00:00Z",
        0,
        None,
        Some("/crosswords/mini-crossword/287"),
      ),
    ) should be("/crosswords/mini/287")
    PuzzlesArchiveBuilder.destination(
      weekendSelection,
      PuzzlesApiItem(
        "820",
        "CROSSWORD_WEEKEND",
        "2026-09-30T00:00:00Z",
        0,
        None,
        Some("/crosswords/weekend-crossword/820"),
      ),
    ) should be("/crosswords/weekend/820")
  }

  it should "exclude puzzles without an archive from the archive selector" in {
    val selection = PuzzlesArchiveBuilder.select(layout, "word-games", None).get

    selection.puzzles.map(_.id) should be(Seq("word-wheel"))
  }

  it should "look up recommendations by the selected puzzle" in {
    val sudoku = PuzzlesArchiveBuilder.select(layout, "logic-puzzles", Some("sudoku-easy")).get
    PuzzlesArchiveBuilder.relatedPuzzleKey(sudoku) should be("sudoku-easy")

    val crosswords = PuzzlesArchiveBuilder.select(layout, "crosswords", None).get
    PuzzlesArchiveBuilder.relatedPuzzleKey(crosswords) should be(crosswords.puzzle.set)
  }

  it should "parse the archive API envelope" in {
    Json
      .parse(
        """{"results":[{"puzzleId":"42","puzzleType":"CROSSWORD_QUICK","publishDate":"2026-09-02T00:00:00Z","gameStatus":"completed","progress":100,"lastUpdated":null,"gameUrl":"https://www.theguardian.com/crosswords/quick/42"}]}""",
      )
      .as[PuzzlesApiResponse] should be(
      PuzzlesApiResponse(
        Seq(
          PuzzlesApiItem(
            "42",
            "CROSSWORD_QUICK",
            "2026-09-02T00:00:00Z",
            100,
            None,
            Some("https://www.theguardian.com/crosswords/quick/42"),
          ),
        ),
      ),
    )
  }
}
