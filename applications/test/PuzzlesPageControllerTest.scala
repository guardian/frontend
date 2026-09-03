package test

import ab.ABTests
import controllers.{PuzzlesLayoutProvider, PuzzlesPageController}
import model.dotcomrendering.{PuzzleContent, PuzzleContainer, PuzzleItem, PuzzlesLayout}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{verify, verifyNoInteractions, when}
import org.scalatest.DoNotDiscover
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WSClient
import play.api.mvc.{AnyContent, Request, RequestHeader, Results}
import play.api.test.Helpers._
import renderers.DotcomRenderingService

import scala.concurrent.{ExecutionContext, Future}

@DoNotDiscover class PuzzlesPageControllerTest
    extends AnyFlatSpec
    with Matchers
    with MockitoSugar
    with ScalaFutures
    with WithTestApplicationContext {

  private val layout = PuzzlesLayout(
    containers = Seq(
      PuzzleContainer(
        title = "Daily puzzles",
        content = PuzzleContent(
          items = Seq(Seq(PuzzleItem("Quick crossword", "crossword", "quick"))),
          nestedContainers = Seq.empty,
        ),
      ),
    ),
  )

  private def controller(
      provider: PuzzlesLayoutProvider,
      renderer: DotcomRenderingService,
  ): PuzzlesPageController =
    new PuzzlesPageController(
      mock[WSClient],
      provider,
      renderer,
      stubControllerComponents(),
    )

  private def successfulProvider: PuzzlesLayoutProvider = {
    val provider = mock[PuzzlesLayoutProvider]
    when(provider.getLayout()(any[ExecutionContext])).thenReturn(Future.successful(layout))
    provider
  }

  private def request(path: String, participations: String = "puzzles-new-hub:variant"): Request[AnyContent] = {
    val rawRequest = TestRequest(path).withHeaders("X-GU-Server-AB-Tests" -> participations)
    rawRequest.withAttrs(ABTests.decorateRequest("X-GU-Server-AB-Tests")(rawRequest).attrs)
  }

  "renderPuzzles" should "load the layout and render the DCR puzzles page" in {
    val provider = successfulProvider
    val renderer = mock[DotcomRenderingService]
    when(renderer.getPuzzlesPage(any[WSClient], any[JsValue])(any[RequestHeader]))
      .thenReturn(Future.successful(Results.Ok("rendered by DCR")))

    val result = controller(provider, renderer).renderPuzzles()(request("/puzzles"))

    status(result) should be(OK)
    contentAsString(result) should be("rendered by DCR")
    verify(provider).getLayout()(any[ExecutionContext])
    verify(renderer).getPuzzlesPage(any[WSClient], any[JsValue])(any[RequestHeader])
  }

  it should "return not found for an unsupported format" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderPuzzles()(request("/puzzles.json"))

    status(result) should be(NOT_FOUND)
  }

  it should "propagate layout provider failures" in {
    val failure = new RuntimeException("layout failed")
    val provider = mock[PuzzlesLayoutProvider]
    when(provider.getLayout()(any[ExecutionContext])).thenReturn(Future.failed(failure))

    val result = controller(provider, mock[DotcomRenderingService]).renderPuzzles()(request("/puzzles"))

    result.failed.futureValue should be(failure)
  }

  it should "propagate DCR renderer failures" in {
    val failure = new RuntimeException("renderer failed")
    val renderer = mock[DotcomRenderingService]
    when(renderer.getPuzzlesPage(any[WSClient], any[JsValue])(any[RequestHeader]))
      .thenReturn(Future.failed(failure))

    val result = controller(successfulProvider, renderer).renderPuzzles()(request("/puzzles"))

    result.failed.futureValue should be(failure)
  }

  "renderPuzzlesJson" should "return the equivalent rendering data as JSON" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderPuzzlesJson()(request("/puzzles.json"))

    status(result) should be(OK)
    contentType(result) should contain("application/json")
    val json = Json.parse(contentAsString(result))
    (json \ "id").as[String] should be("/puzzles.json")
    (json \ "webTitle").as[String] should be("Puzzles and Games")
    (json \ "layout").as[JsValue] should be(Json.toJson(layout))
  }

  it should "return not found when the JSON action receives an HTML request" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderPuzzlesJson()(request("/puzzles"))

    status(result) should be(NOT_FOUND)
  }

  it should "return not found for another unsupported format" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderPuzzlesJson()(request("/puzzles.atom"))

    status(result) should be(NOT_FOUND)
  }

  Seq(
    "control" -> "puzzles-new-hub:control",
    "absent" -> "",
    "malformed" -> "puzzles-new-hub:,puzzles-new-hub:variant:extra",
    "unknown group" -> "puzzles-new-hub:unknown",
    "unrelated experiment" -> "another-test:variant",
  ).foreach { case (participationCase, participations) =>
    s"puzzles hub access with $participationCase participation" should
      "return not found for HTML and JSON without loading the layout or calling DCR" in {
        val provider = mock[PuzzlesLayoutProvider]
        val renderer = mock[DotcomRenderingService]
        val puzzlesController = controller(provider, renderer)

        val htmlResult = puzzlesController.renderPuzzles()(request("/puzzles", participations))
        val jsonResult = puzzlesController.renderPuzzlesJson()(request("/puzzles.json", participations))

        status(htmlResult) should be(NOT_FOUND)
        status(jsonResult) should be(NOT_FOUND)
        verifyNoInteractions(provider, renderer)
      }
  }
}
