package test

import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

@DoNotDiscover class PuzzlesRoutesTest extends AnyFlatSpec with Matchers {

  "The Applications routes" should "expose the puzzles HTML endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderPuzzles()

    route.method should be("GET")
    route.url should be("/puzzles")
  }

  it should "expose the puzzles JSON endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderPuzzlesJson()

    route.method should be("GET")
    route.url should be("/puzzles.json")
  }

  it should "expose the Game Page HTML endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderGame("sudoku-easy")

    route.method should be("GET")
    route.url should be("/puzzles/sudoku-easy")
  }

  it should "expose the Game Page JSON endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderGameJson("sudoku-easy")

    route.method should be("GET")
    route.url should be("/puzzles/sudoku-easy.json")
  }

  it should "not clash with, or reorder, the existing crossword routes" in {
    val crosswordRoute = controllers.routes.CrosswordPageController.crossword("cryptic", 26697)

    crosswordRoute.method should be("GET")
    crosswordRoute.url should be("/crosswords/cryptic/26697")
  }
}
