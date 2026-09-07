package test

import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

@DoNotDiscover class GamePageRoutesTest extends AnyFlatSpec with Matchers {

  "The Applications routes" should "expose the Game Page HTML endpoint" in {
    val route = controllers.routes.GamePageController.renderGame("sudoku-easy")

    route.method should be("GET")
    route.url should be("/puzzles/sudoku-easy")
  }

  it should "expose the Game Page JSON endpoint" in {
    val route = controllers.routes.GamePageController.renderGameJson("sudoku-easy")

    route.method should be("GET")
    route.url should be("/puzzles/sudoku-easy.json")
  }

  it should "expose the Game Page crossword HTML endpoint using path segments, not query params" in {
    val route = controllers.routes.GamePageController.renderCrossword("cryptic", 26697)

    route.method should be("GET")
    route.url should be("/puzzles/crossword/cryptic/26697")
  }

  it should "expose the Game Page crossword JSON endpoint using path segments, not query params" in {
    val route = controllers.routes.GamePageController.renderCrosswordJson("cryptic", 26697)

    route.method should be("GET")
    route.url should be("/puzzles/crossword/cryptic/26697.json")
  }

  it should "not clash with, or reorder, the existing crossword routes" in {
    val crosswordRoute = controllers.routes.CrosswordPageController.crossword("cryptic", 26697)

    crosswordRoute.method should be("GET")
    crosswordRoute.url should be("/crosswords/cryptic/26697")
  }
}
