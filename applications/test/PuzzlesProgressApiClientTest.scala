package test

import conf.Configuration
import controllers.PuzzlesProgressApiClient
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{any, endsWith}
import org.mockito.Mockito.{verify, when}
import org.scalatest.DoNotDiscover
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.{BodyWritable, WSClient, WSRequest, WSResponse}

import java.time.LocalDate
import scala.concurrent.Future

@DoNotDiscover class PuzzlesProgressApiClientTest
    extends AnyFlatSpec
    with Matchers
    with MockitoSugar
    with ScalaFutures
    with WithTestExecutionContext {

  "query" should "post the expected payload and optional Authorization header" in {
    val wsClient = mock[WSClient]
    val wsRequest = mock[WSRequest]
    val wsResponse = mock[WSResponse]
    when(wsClient.url(endsWith("/progress/query"))).thenReturn(wsRequest)
    when(wsRequest.withHttpHeaders(any())).thenReturn(wsRequest)
    when(wsRequest.withRequestTimeout(any())).thenReturn(wsRequest)
    when(wsRequest.post(any[JsValue])(any[BodyWritable[JsValue]])).thenReturn(Future.successful(wsResponse))
    when(wsResponse.status).thenReturn(200)
    when(wsResponse.json).thenReturn(
      Json.obj(
        "results" -> Json.arr(
          Json.obj(
            "puzzleId" -> "123",
            "puzzleType" -> "CROSSWORD_QUICK",
            "publishDate" -> "2026-10-02T00:00:00Z",
            "progress" -> 100,
            "setterName" -> "A setter",
            "gameUrl" -> "/crosswords/quick/123",
          ),
        ),
      ),
    )

    val results = new PuzzlesProgressApiClient(wsClient)
      .query(
        LocalDate.of(2026, 10, 2),
        Seq("CROSSWORD_QUICK", "SUDOKU_EASY"),
        Some("Bearer access-token"),
      )
      .futureValue

    results.map(_.puzzleType) shouldBe Seq("CROSSWORD_QUICK")
    verify(wsRequest).withHttpHeaders(
      "X-Api-Key" -> Configuration.puzzlesApi.apiKey,
      "Accept" -> "application/json",
      "Authorization" -> "Bearer access-token",
    )
    val body = ArgumentCaptor.forClass(classOf[JsValue])
    verify(wsRequest).post(body.capture())(any[BodyWritable[JsValue]])
    body.getValue shouldBe Json.obj(
      "date" -> "2026-10-02T00:00:00Z",
      "puzzleTypes" -> Seq("CROSSWORD_QUICK", "SUDOKU_EASY"),
    )
  }
}
