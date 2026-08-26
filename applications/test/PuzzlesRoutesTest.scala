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
}
