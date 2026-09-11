package test

import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

@DoNotDiscover class PuzzlesRoutesTest extends AnyFlatSpec with Matchers {

  "The Applications routes" should "expose the puzzles hub HTML endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderPuzzles()

    route.method should be("GET")
    route.url should be("/puzzles-and-games")
  }

  it should "expose the puzzles hub JSON endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderPuzzlesJson()

    route.method should be("GET")
    route.url should be("/puzzles-and-games.json")
  }

  it should "expose the nested Sudoku HTML endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderSudoku("easy")

    route.method should be("GET")
    route.url should be("/puzzles-and-games/sudoku/easy")
  }

  it should "expose the nested Sudoku JSON endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderSudokuJson("killer")

    route.method should be("GET")
    route.url should be("/puzzles-and-games/sudoku/killer.json")
  }

  it should "expose the flat (single-segment) Puzzle Page HTML endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderPuzzlePage("wordiply")

    route.method should be("GET")
    route.url should be("/puzzles-and-games/wordiply")
  }

  it should "expose the flat (single-segment) Puzzle Page JSON endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderPuzzlePageJson("word-wheel")

    route.method should be("GET")
    route.url should be("/puzzles-and-games/word-wheel.json")
  }

  it should "not clash with, or reorder, the existing crossword routes" in {
    val crosswordRoute = controllers.routes.CrosswordPageController.crossword("cryptic", 26697)

    crosswordRoute.method should be("GET")
    crosswordRoute.url should be("/crosswords/cryptic/26697")
  }
}
