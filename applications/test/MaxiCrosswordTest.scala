package test

import ab.ABTests
import com.gu.contentapi.client.model.v1.{Content, ContentType, Crossword, CrosswordType, ItemResponse}
import com.gu.contentapi.json.CirceDecoders._
import contentapi.ContentApiClient
import controllers.{CrosswordController, PuzzlesLayoutProvider, PuzzlesNewsletters}
import io.circe.parser.decode
import model.Cached
import org.mockito.Mockito.mock
import org.scalatest.{EitherValues, OptionValues}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import play.api.test.FakeRequest
import play.api.test.Helpers._
import views.support.CamelCase

import scala.concurrent.Future

class MaxiCrosswordTest extends AnyFlatSpec with Matchers with EitherValues with OptionValues {
  private val crossword = decode[Crossword]("""{
      "name": "Maxi crossword No 1",
      "type": "maxi",
      "number": 1,
      "date": "2026-11-23T00:00:00Z",
      "dimensions": { "cols": 15, "rows": 15 },
      "entries": [],
      "solutionAvailable": false,
      "hasNumbers": true,
      "randomCluesOrdering": false
    }""").value

  "The CAPI model" should "decode a Maxi crossword and preserve its URL type and grid dimensions" in {
    crossword.`type` shouldBe CrosswordType.Maxi
    CamelCase.toHyphenated(crossword.`type`.name) shouldBe "maxi"
    crossword.dimensions.cols shouldBe 15
    crossword.dimensions.rows shouldBe 15
  }

  private class TestController extends CrosswordController {
    override lazy val controllerComponents = stubControllerComponents()
    override val contentApiClient = mock(classOf[ContentApiClient])
    override val puzzlesNewsletters = mock(classOf[PuzzlesNewsletters])
    override val puzzlesLayoutProvider = mock(classOf[PuzzlesLayoutProvider])
    override val wsClient = mock(classOf[WSClient])
    var lookups = List.empty[String]

    override def noResults()(implicit request: RequestHeader): Result = NotFound

    override def getCrossword(crosswordType: String, id: Int)(implicit request: RequestHeader): Future[ItemResponse] = {
      val path = s"crosswords/$crosswordType/$id"
      lookups = lookups :+ path
      Future.successful(
        ItemResponse(
          status = "ok",
          userTier = "internal",
          content = Some(
            Content(
              id = path,
              `type` = ContentType.Crossword,
              webTitle = crossword.name,
              webUrl = s"https://www.theguardian.com/$path",
              apiUrl = s"https://content.guardianapis.com/$path",
              crossword = Some(crossword),
            ),
          ),
        ),
      )
    }

    def load(crosswordType: String, participation: String): Future[Result] = {
      implicit val request: RequestHeader = ABTests.decorateRequest("X-GU-Server-AB-Tests")(
        FakeRequest().withHeaders("X-Gu-Edition" -> "UK", "X-GU-Server-AB-Tests" -> participation),
      )
      withCrossword(crosswordType, 1)((_, content) => Future.successful(Cached.explicitlyCache(60)(Ok(content.id))))
    }
  }

  "Maxi crossword routes" should "return an uncacheable 404 without fetching CAPI in the control group" in {
    val controller = new TestController
    val result = controller.load("maxi", "puzzles-crosswords-maxi:control")
    status(result) shouldBe NOT_FOUND
    header(CACHE_CONTROL, result).value should include("no-store")
    header("Surrogate-Control", result) shouldBe Some("no-store")
    controller.lookups shouldBe empty
  }

  it should "not serve Maxi to readers in V3 alone" in {
    val controller = new TestController
    status(controller.load("maxi", "puzzles-new-hub-v3:variant")) shouldBe NOT_FOUND
    controller.lookups shouldBe empty
  }

  it should "serve Maxi to opted-in readers without V3 or caching across groups" in {
    val controller = new TestController
    val result = controller.load("maxi", "puzzles-crosswords-maxi:variant")
    status(result) shouldBe OK
    contentAsString(result) shouldBe "crosswords/maxi/1"
    header(CACHE_CONTROL, result).value should include("no-store")
    header("Surrogate-Control", result) shouldBe Some("no-store")
  }

  it should "keep other crossword types available and cacheable in the control group" in {
    val controller = new TestController
    val result = controller.load("mini", "puzzles-crosswords-maxi:control")
    status(result) shouldBe OK
    contentAsString(result) shouldBe "crosswords/mini/1"
    header("Surrogate-Control", result).value should include("max-age=60")
  }
}
