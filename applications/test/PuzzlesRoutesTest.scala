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

  it should "expose the archive endpoints" in {
    controllers.routes.PuzzlesPageController.renderCrosswordsArchive().url should be(
      "/puzzles-and-games/crosswords/archive",
    )
    controllers.routes.PuzzlesPageController.renderWordGamesArchive().url should be(
      "/puzzles-and-games/word-games/archive",
    )
    controllers.routes.PuzzlesPageController.renderLogicPuzzlesArchive().url should be(
      "/puzzles-and-games/logic-puzzles/archive",
    )
    controllers.routes.PuzzlesPageController.renderTriviaAndQuizzesArchive().url should be(
      "/puzzles-and-games/trivia-and-quizzes/archive",
    )
  }

  it should "keep archive data selections in the path when the CDN strips query parameters" in {
    Seq("crosswords", "word-games", "logic-puzzles", "trivia-and-quizzes").foreach { category =>
      controllers.routes.PuzzlesPageController.archiveDataForMonth(category, "test-puzzle", 2020, 8).url should be(
        s"/puzzles-and-games/$category/archive-data/test-puzzle/2020/8",
      )
    }
  }

  it should "expose the nested, dated Sudoku HTML endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderSudoku("easy", "2024-01-15")

    route.method should be("GET")
    route.url should be("/puzzles-and-games/logic-puzzles/sudoku-easy/2024-01-15")
  }

  it should "expose the nested, dated Sudoku JSON endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderSudokuJson("killer", "2024-01-15")

    route.method should be("GET")
    route.url should be("/puzzles-and-games/logic-puzzles/sudoku-killer/2024-01-15.json")
  }

  it should "expose the bare (dateless) Sudoku archive-redirect endpoint" in {
    val route = controllers.routes.PuzzlesPageController.redirectSudokuArchive("hard")

    route.method should be("GET")
    route.url should be("/puzzles-and-games/logic-puzzles/sudoku-hard")
  }

  it should "expose the nested, dated word wheel HTML endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderWordWheel("2024-01-15")

    route.method should be("GET")
    route.url should be("/puzzles-and-games/word-games/word-wheel/2024-01-15")
  }

  it should "expose the nested, dated word wheel JSON endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderWordWheelJson("2024-01-15")

    route.method should be("GET")
    route.url should be("/puzzles-and-games/word-games/word-wheel/2024-01-15.json")
  }

  it should "expose the bare (dateless) word wheel archive-redirect endpoint" in {
    val route = controllers.routes.PuzzlesPageController.redirectWordWheelArchive()

    route.method should be("GET")
    route.url should be("/puzzles-and-games/word-games/word-wheel")
  }

  it should "expose the nested, dated wordiply HTML endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderWordiply("2024-01-15")

    route.method should be("GET")
    route.url should be("/puzzles-and-games/word-games/wordiply/2024-01-15")
  }

  it should "expose the nested, dated wordiply JSON endpoint" in {
    val route = controllers.routes.PuzzlesPageController.renderWordiplyJson("2024-01-15")

    route.method should be("GET")
    route.url should be("/puzzles-and-games/word-games/wordiply/2024-01-15.json")
  }

  it should "expose the bare (dateless) wordiply archive-redirect endpoint" in {
    val route = controllers.routes.PuzzlesPageController.redirectWordiplyArchive()

    route.method should be("GET")
    route.url should be("/puzzles-and-games/word-games/wordiply")
  }

  it should "expose dated HTML, JSON and bare archive redirects for MovieGrid games" in {
    val routes = controllers.routes.PuzzlesPageController
    Seq(
      (
        "film-reveal",
        routes.renderFilmReveal("2026-09-26"),
        routes.renderFilmRevealJson("2026-09-26"),
        routes.redirectFilmRevealArchive(),
      ),
      (
        "on-the-ball",
        routes.renderOnTheBall("2026-09-26"),
        routes.renderOnTheBallJson("2026-09-26"),
        routes.redirectOnTheBallArchive(),
      ),
    ).foreach { case (slug, html, json, archive) =>
      val path = s"/puzzles-and-games/trivia-and-quizzes/$slug"
      html.url shouldBe s"$path/2026-09-26"
      json.url shouldBe s"$path/2026-09-26.json"
      archive.url shouldBe path
      Seq(html, json, archive).foreach(_.method shouldBe "GET")
    }
  }

  it should "not clash with, or reorder, the existing crossword routes" in {
    val crosswordRoute = controllers.routes.CrosswordPageController.crossword("cryptic", 26697)

    crosswordRoute.method should be("GET")
    crosswordRoute.url should be("/crosswords/cryptic/26697")
  }
}
