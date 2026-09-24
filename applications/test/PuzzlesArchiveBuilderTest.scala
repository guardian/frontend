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

  it should "use an archive item's exact date and provider ID in its destination" in {
    val selection = PuzzlesArchiveBuilder.select(layout, "logic-puzzles", None).get
    val destination = PuzzlesArchiveBuilder.destination(
      selection,
      ArchiveApiItem("guardian-sudoku-20260902", "SUDOKU_EASY", "2026-09-02", 0, None, None),
    )
    destination should be(
      "/puzzles-and-games/logic-puzzles/sudoku-easy/2026-09-02?puzzleId=guardian-sudoku-20260902",
    )
  }

  it should "parse the archive API envelope" in {
    Json
      .parse(
        """{"items":[{"puzzleId":"42","puzzleType":"CROSSWORD_QUICK","date":"2026-09-02","progress":100}]}""",
      )
      .as[ArchiveApiResponse] should be(
      ArchiveApiResponse(Seq(ArchiveApiItem("42", "CROSSWORD_QUICK", "2026-09-02", 100, None, None))),
    )
  }
}
