package test

import conf.Configuration
import controllers.PuzzlesGameApiClient
import org.mockito.ArgumentMatchers.{any, endsWith}
import org.mockito.Mockito.{verify, when}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}

import java.time.LocalDate
import scala.concurrent.{Await, Future}
import scala.concurrent.duration._

class PuzzlesGameApiClientTest extends AnyFlatSpec with Matchers with MockitoSugar with WithTestExecutionContext {
  private val date = LocalDate.of(2026, 9, 26)
  private val game = Json.obj(
    "puzzleId" -> "opaque-id",
    "puzzleType" -> "SUDOKU_EASY",
    "publishDate" -> "2026-09-26T00:00:00Z",
    "progress" -> 0,
    "gameUrl" -> "https://tg.amuselabs.com/guardian/date-picker?id=opaque-id&set=api-series&embed=1",
  )

  private def fixture(status: Int = 200) = {
    val ws = mock[WSClient]
    val request = mock[WSRequest]
    val response = mock[WSResponse]
    when(ws.url(endsWith("/game"))).thenReturn(request)
    when(request.withHttpHeaders(any())).thenReturn(request)
    when(request.withQueryStringParameters(any())).thenReturn(request)
    when(request.withRequestTimeout(any())).thenReturn(request)
    when(request.get()).thenReturn(Future.successful(response))
    when(response.status).thenReturn(status)
    when(response.json).thenReturn(game)
    (new PuzzlesGameApiClient(ws), request, response)
  }

  "PuzzlesGameApiClient" should "GET a single dated game anonymously using the configured API key" in {
    val (client, request, _) = fixture()
    val result = Await.result(client.get("SUDOKU_EASY", date), 5.seconds).get
    result.puzzleId shouldBe "opaque-id"
    result.gameUrl shouldBe (game \ "gameUrl").asOpt[String]
    verify(request).withQueryStringParameters("puzzleType" -> "SUDOKU_EASY", "date" -> "2026-09-26")
    verify(request).withHttpHeaders("X-Api-Key" -> Configuration.puzzlesApi.apiKey, "Accept" -> "application/json")
  }

  it should "return None for a missing game" in {
    val (client, _, _) = fixture(404)
    Await.result(client.get("SUDOKU_EASY", date), 5.seconds) shouldBe None
  }

  it should "reject upstream errors and malformed or mismatched responses" in {
    val (unavailable, _, _) = fixture(502)
    intercept[RuntimeException](Await.result(unavailable.get("SUDOKU_EASY", date), 5.seconds))
    Seq(Json.obj(), game ++ Json.obj("puzzleType" -> "WORDWHEEL"), game ++ Json.obj("publishDate" -> "2026-09-25"))
      .foreach { body =>
        val (client, _, response) = fixture()
        when(response.json).thenReturn(body)
        intercept[IllegalArgumentException](Await.result(client.get("SUDOKU_EASY", date), 5.seconds))
      }
  }
}
