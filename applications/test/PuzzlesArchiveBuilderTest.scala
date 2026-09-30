package test

import controllers.{ArchiveApiItem, ArchiveApiResponse, PuzzlesArchiveBuilder}
import model.dotcomrendering.{PuzzleContainer, PuzzleContent, PuzzleItem, PuzzlesLayout}
import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.Json

@DoNotDiscover class PuzzlesArchiveBuilderTest extends AnyFlatSpec with Matchers {
  private val quick = PuzzleItem("archive-quick", "Quick", "crossword", "quick", "archive")
  private val sudoku = PuzzleItem(
    "sudoku-easy",
    "Easy sudoku",
    "sudoku",
    "easy",
    "primary",
    slug = Some("logic-puzzles/sudoku-easy"),
  )
  private val layout = PuzzlesLayout(
    Seq(
      PuzzleContainer(
        "crosswords",
        "Crosswords",
        Some("standard"),
        PuzzleContent(Nil, Nil, archiveChoices = Some(Seq(quick))),
      ),
      PuzzleContainer("logic-puzzles", "Logic puzzles", Some("standard"), PuzzleContent(Seq(Seq(sudoku)), Nil)),
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
      ArchiveApiItem("guardian-sudoku-20260902", "SUDOKU_EASY", "2026-09-02T00:00:00Z", 0, None, None),
    )
    destination should be("/puzzles-and-games/logic-puzzles/sudoku-easy/2026-09-02")
  }

  it should "reuse Puzzle Page recommendations for the selected archive puzzle" in {
    val selection = PuzzlesArchiveBuilder.select(layout, "logic-puzzles", Some("sudoku-easy")).get
    val items = Seq(
      ArchiveApiItem(
        "guardian-sudoku-20260902",
        "SUDOKU_EASY",
        "2026-09-02T00:00:00Z",
        0,
        None,
        None,
      ),
    )

    val related = PuzzlesArchiveBuilder.related(selection, 2026, 9, items)

    related.map(_.id) should be(Seq("sudoku-medium", "word-wheel", "crossword-quick"))
    related.map(_.cardVariant) should contain only "compact"
    related.map(_.url) should contain(
      Some("/puzzles-and-games/logic-puzzles/sudoku-medium/2026-09-02"),
    )
  }

  it should "recommend logic and word games from crossword archives" in {
    val selection = PuzzlesArchiveBuilder.select(layout, "crosswords", None).get

    val related = PuzzlesArchiveBuilder.related(selection, 2026, 9, Nil)

    related.map(_.id) should be(Seq("sudoku-easy", "word-wheel", "wordiply"))
  }

  it should "parse the archive API envelope" in {
    Json
      .parse(
        """{"results":[{"puzzleId":"42","puzzleType":"CROSSWORD_QUICK","publishDate":"2026-09-02T00:00:00Z","gameStatus":"completed","progress":100,"lastUpdated":null,"gameUrl":"https://www.theguardian.com/crosswords/quick/42"}]}""",
      )
      .as[ArchiveApiResponse] should be(
      ArchiveApiResponse(
        Seq(
          ArchiveApiItem(
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
