package test

import conf.Configuration
import controllers.{PuzzleAccess, PuzzlesAccessApiClient}
import org.mockito.ArgumentMatchers.{any, endsWith}
import org.mockito.Mockito.{never, verify, when}
import org.scalatest.DoNotDiscover
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}

import java.time.LocalDate
import scala.concurrent.Future
import scala.concurrent.duration._

@DoNotDiscover class PuzzlesAccessApiClientTest
    extends AnyFlatSpec
    with Matchers
    with MockitoSugar
    with ScalaFutures
    with WithTestExecutionContext {

  private val puzzleId = "guardian-sudoku-easy-20261109"
  private val date = LocalDate.of(2026, 11, 9)
  private val path = s"/v1/game/$puzzleId/access/2026-11-09"

  private class Upstream(status: Int, json: JsValue = Json.obj("isPremium" -> false, "hasAccess" -> true)) {
    val wsClient: WSClient = mock[WSClient]
    val wsRequest: WSRequest = mock[WSRequest]
    private val wsResponse = mock[WSResponse]
    when(wsClient.url(endsWith(path))).thenReturn(wsRequest)
    when(wsRequest.withHttpHeaders(any())).thenReturn(wsRequest)
    when(wsRequest.withRequestTimeout(any())).thenReturn(wsRequest)
    when(wsRequest.get()).thenReturn(Future.successful(wsResponse))
    when(wsResponse.status).thenReturn(status)
    when(wsResponse.json).thenReturn(json)
    when(wsResponse.body).thenReturn(json.toString)
  }

  "check" should "GET the access path with the API key and the reader's own Authorization header" in {
    val upstream = new Upstream(200)

    val access = new PuzzlesAccessApiClient(upstream.wsClient)
      .check(puzzleId, date, "Bearer reader-token")
      .futureValue

    access shouldBe PuzzleAccess(isPremium = false, hasAccess = true)
    verify(upstream.wsRequest).withHttpHeaders(
      "X-Api-Key" -> Configuration.puzzlesApi.apiKey,
      "Accept" -> "application/json",
      "Authorization" -> "Bearer reader-token",
    )
  }

  it should "give up before the browser does" in {
    val upstream = new Upstream(200)

    new PuzzlesAccessApiClient(upstream.wsClient).check(puzzleId, date, "Bearer reader-token").futureValue

    verify(upstream.wsRequest).withRequestTimeout(2.seconds)
  }

  it should "report a premium puzzle the reader may not play as an answer, not a failure" in {
    val upstream = new Upstream(200, Json.obj("isPremium" -> true, "hasAccess" -> false))

    new PuzzlesAccessApiClient(upstream.wsClient)
      .check(puzzleId, date, "Bearer reader-token")
      .futureValue shouldBe PuzzleAccess(isPremium = true, hasAccess = false)
  }

  it should "fail, never answer, for every non-2xx status" in {
    List(400, 401, 403, 404, 429, 500, 502, 503).foreach { status =>
      val upstream = new Upstream(status, Json.obj("message" -> "nope"))

      new PuzzlesAccessApiClient(upstream.wsClient)
        .check(puzzleId, date, "Bearer reader-token")
        .failed
        .futureValue shouldBe a[RuntimeException]
    }
  }

  it should "fail on an invalid body" in {
    List(Json.obj("nope" -> true), Json.obj("isPremium" -> true), Json.obj("hasAccess" -> "yes")).foreach { json =>
      val upstream = new Upstream(200, json)

      new PuzzlesAccessApiClient(upstream.wsClient)
        .check(puzzleId, date, "Bearer reader-token")
        .failed
        .futureValue shouldBe an[IllegalArgumentException]
    }
  }

  it should "fail when the request itself fails" in {
    val wsClient = mock[WSClient]
    val wsRequest = mock[WSRequest]
    when(wsClient.url(endsWith(path))).thenReturn(wsRequest)
    when(wsRequest.withHttpHeaders(any())).thenReturn(wsRequest)
    when(wsRequest.withRequestTimeout(any())).thenReturn(wsRequest)
    when(wsRequest.get()).thenReturn(Future.failed(new java.util.concurrent.TimeoutException("too slow")))

    new PuzzlesAccessApiClient(wsClient)
      .check(puzzleId, date, "Bearer reader-token")
      .failed
      .futureValue shouldBe a[java.util.concurrent.TimeoutException]
  }

  it should "refuse a malformed puzzle id without calling the Puzzles API" in {
    List("../state", "a/b", "a b", "a?b=c", "", "a" * 257).foreach { malformed =>
      val wsClient = mock[WSClient]

      new PuzzlesAccessApiClient(wsClient)
        .check(malformed, date, "Bearer reader-token")
        .failed
        .futureValue shouldBe an[IllegalArgumentException]
      verify(wsClient, never()).url(any())
    }
  }
}
