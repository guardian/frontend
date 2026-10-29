package test

import ab.ABTests
import controllers.SiteMapController
import jobs.SiteMapJob
import org.mockito.Mockito.verifyNoInteractions
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.mvc.{AnyContent, Request}
import play.api.test.Helpers._

import scala.xml.XML

class PuzzlesSiteMapControllerTest extends AnyFlatSpec with Matchers with MockitoSugar {
  private val job = mock[SiteMapJob]
  private val controller = new SiteMapController(job, stubControllerComponents())
  private val abTestHeader = "X-GU-Server-AB-Tests"

  private def request(participation: String): Request[AnyContent] = {
    val raw = TestRequest("/sitemaps/puzzles-and-games.xml").withHeaders(abTestHeader -> participation)
    raw.withAttrs(ABTests.decorateRequest(abTestHeader)(raw).attrs)
  }

  "Puzzles sitemap" should "serve only the canonical hub and three archive URLs to the experiment variant" in {
    val result = controller.renderPuzzlesSiteMap()(request("puzzles-new-hub-v1:variant"))

    status(result) shouldBe OK
    contentType(result) shouldBe Some("text/xml")
    charset(result) shouldBe Some("utf-8")
    val xml = XML.loadString(contentAsString(result))
    xml.label shouldBe "urlset"
    xml.namespace shouldBe "http://www.sitemaps.org/schemas/sitemap/0.9"
    (xml \ "url" \ "loc").map(_.text) should contain theSameElementsAs Seq(
      "https://www.theguardian.com/puzzles-and-games",
      "https://www.theguardian.com/puzzles-and-games/crosswords/archive",
      "https://www.theguardian.com/puzzles-and-games/logic-puzzles/archive",
      "https://www.theguardian.com/puzzles-and-games/word-games/archive",
    )
    verifyNoInteractions(job)
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
