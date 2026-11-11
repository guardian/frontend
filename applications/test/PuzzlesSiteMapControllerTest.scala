package test

import ab.ABTests
import controllers.{PuzzlesLayoutProvider, SiteMapController}
import jobs.SiteMapJob
import model.dotcomrendering.{PuzzleContainer, PuzzleContent, PuzzleItem, PuzzlesLayout}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{verifyNoInteractions, when}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.mvc.{AnyContent, Request}
import play.api.test.Helpers._

import scala.concurrent.{ExecutionContext, Future}
import scala.xml.XML

class PuzzlesSiteMapControllerTest extends AnyFlatSpec with Matchers with MockitoSugar {
  private val job = mock[SiteMapJob]
  private val layoutProvider = mock[PuzzlesLayoutProvider]
  when(layoutProvider.getLayout()(any[ExecutionContext])).thenReturn(
    Future.successful(
      PuzzlesLayout(
        Seq(
          PuzzleContainer(
            "crosswords",
            "Crosswords",
            content = PuzzleContent(
              Nil,
              Nil,
              archiveChoices = Some(
                Seq(
                  PuzzleItem("archive-quick", "Quick", "crossword", "quick", "archive"),
                  PuzzleItem("archive-mini", "Mini", "crossword", "mini", "archive"),
                ),
              ),
            ),
          ),
          PuzzleContainer(
            "trivia-and-quizzes",
            "Trivia & quizzes",
            content = PuzzleContent(
              Seq(
                Seq(
                  PuzzleItem(
                    "film-reveal",
                    "Film reveal",
                    "film-reveal",
                    "all",
                    "primary",
                    slug = Some("trivia-and-quizzes/film-reveal"),
                  ),
                ),
              ),
              Nil,
            ),
          ),
        ),
      ),
    ),
  )
  private val controller = new SiteMapController(job, layoutProvider, stubControllerComponents())
  private val abTestHeader = "X-GU-Server-AB-Tests"

  private def request(participation: String): Request[AnyContent] = {
    val raw = TestRequest("/sitemaps/puzzles-and-games.xml").withHeaders(abTestHeader -> participation)
    raw.withAttrs(ABTests.decorateRequest(abTestHeader)(raw).attrs)
  }

  "Puzzles sitemap" should "serve the canonical hub and archive URLs to the experiment variant" in {
    val result = controller.renderPuzzlesSiteMap()(request("puzzles-new-hub-v1:variant"))

    status(result) shouldBe OK
    contentType(result) shouldBe Some("text/xml")
    charset(result) shouldBe Some("utf-8")
    val xml = XML.loadString(contentAsString(result))
    xml.label shouldBe "urlset"
    xml.namespace shouldBe "http://www.sitemaps.org/schemas/sitemap/0.9"
    (xml \ "url" \ "loc").map(_.text) should contain allElementsOf Seq(
      "https://www.theguardian.com/puzzles-and-games",
      "https://www.theguardian.com/puzzles-and-games/crosswords/archive",
      "https://www.theguardian.com/puzzles-and-games/logic-puzzles/archive",
      "https://www.theguardian.com/puzzles-and-games/word-games/archive",
      "https://www.theguardian.com/puzzles-and-games/trivia-and-quizzes/archive",
    )
    verifyNoInteractions(job)
  }

  it should "list each puzzle's own archive page, and trivia only when hub v2 is enabled" in {
    def locs(participation: String): Seq[String] =
      (XML.loadString(contentAsString(controller.renderPuzzlesSiteMap()(request(participation)))) \ "url" \ "loc")
        .map(_.text)

    val crosswordPuzzles = Seq(
      "https://www.theguardian.com/puzzles-and-games/crosswords/quick/archive",
      "https://www.theguardian.com/puzzles-and-games/crosswords/mini/archive",
    )
    val trivia = "https://www.theguardian.com/puzzles-and-games/trivia-and-quizzes/film-reveal/archive"

    locs("puzzles-new-hub-v1:variant") should contain allElementsOf crosswordPuzzles
    locs("puzzles-new-hub-v1:variant") should not contain trivia
    locs("puzzles-new-hub-v1:variant,puzzles-new-hub-v2:variant") should contain(trivia)
  }

  it should "support cache revalidation for the enabled variant" in {
    val enabled = request("puzzles-new-hub-v1:variant")
    val first = controller.renderPuzzlesSiteMap()(enabled)
    val etag = header(ETAG, first).get
    header(CACHE_CONTROL, first).get should include("max-age=60")

    val revalidated = controller.renderPuzzlesSiteMap()(enabled.withHeaders(enabled.headers.add(IF_NONE_MATCH -> etag)))
    status(revalidated) shouldBe NOT_MODIFIED
  }

  Seq(
    "control" -> "puzzles-new-hub-v1:control",
    "absent" -> "",
    "unknown group" -> "puzzles-new-hub-v1:unknown",
    "v2 only" -> "puzzles-new-hub-v2:variant",
  ).foreach { case (name, participation) =>
    it should s"return an uncached 404 for $name participation, even with a matching ETag" in {
      val etag = header(ETAG, controller.renderPuzzlesSiteMap()(request("puzzles-new-hub-v1:variant"))).get
      val disabled = request(participation)
      val result = controller.renderPuzzlesSiteMap()(disabled.withHeaders(disabled.headers.add(IF_NONE_MATCH -> etag)))

      status(result) shouldBe NOT_FOUND
      header(CACHE_CONTROL, result).get should include("no-cache")
    }
  }
}
