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

  it should "expose the top-level Sudoku HTML endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderSudoku("easy")

    route.method should be("GET")
    route.url should be("/sudoku/easy")
  }

  it should "expose the top-level Sudoku JSON endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderSudokuJson("killer")

    route.method should be("GET")
    route.url should be("/sudoku/killer.json")
  }

  it should "expose the top-level word wheel HTML endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderWordWheel()

    route.method should be("GET")
    route.url should be("/word-wheel")
  }

  it should "expose the top-level word wheel JSON endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderWordWheelJson()

    route.method should be("GET")
    route.url should be("/word-wheel.json")
  }

  it should "expose the top-level wordiply HTML endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderWordiply()

    route.method should be("GET")
    route.url should be("/wordiply")
  }

  it should "expose the top-level wordiply JSON endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderWordiplyJson()

    route.method should be("GET")
    route.url should be("/wordiply.json")
  }

  it should "not clash with, or reorder, the existing crossword routes" in {
    val crosswordRoute = controllers.routes.CrosswordPageController.crossword("cryptic", 26697)

    crosswordRoute.method should be("GET")
    crosswordRoute.url should be("/crosswords/cryptic/26697")
  }
}
