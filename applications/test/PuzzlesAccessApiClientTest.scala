package test

import conf.Configuration
import controllers.PuzzlesAccessApiClient
import org.mockito.ArgumentMatchers.{any, endsWith}
import org.mockito.Mockito.{verify, when}
import org.scalatest.DoNotDiscover
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}

import scala.concurrent.Future

@DoNotDiscover class PuzzlesAccessApiClientTest
    extends AnyFlatSpec
    with Matchers
    with MockitoSugar
    with ScalaFutures
    with WithTestExecutionContext {

  private def clientAnswering(status: Int, body: JsValue = Json.obj()) = {
    val wsClient = mock[WSClient]
    val wsRequest = mock[WSRequest]
    val wsResponse = mock[WSResponse]
    when(wsClient.url(endsWith("/access"))).thenReturn(wsRequest)
    when(wsRequest.withQueryStringParameters(any())).thenReturn(wsRequest)
    when(wsRequest.withHttpHeaders(any())).thenReturn(wsRequest)
    when(wsRequest.withRequestTimeout(any())).thenReturn(wsRequest)
    when(wsRequest.get()).thenReturn(Future.successful(wsResponse))
    when(wsResponse.status).thenReturn(status)
    when(wsResponse.json).thenReturn(body)
    when(wsResponse.body).thenReturn(body.toString)
    (new PuzzlesAccessApiClient(wsClient), wsRequest)
  }

  "hasAccess" should "send the puzzle id, the API key and the reader's Authorization header" in {
    val (client, wsRequest) = clientAnswering(200, Json.obj("hasAccess" -> true))

    client.hasAccess("guardian-sudoku-easy-20261009", "Bearer access-token").futureValue should be(true)

    verify(wsRequest).withQueryStringParameters("puzzleId" -> "guardian-sudoku-easy-20261009")
    verify(wsRequest).withHttpHeaders(
      "X-Api-Key" -> Configuration.puzzlesApi.apiKey,
      "Accept" -> "application/json",
      "Authorization" -> "Bearer access-token",
    )
  }

  it should "report false when the response says there is no access" in {
    val (client, _) = clientAnswering(200, Json.obj("hasAccess" -> false))

    client.hasAccess("id", "Bearer t").futureValue should be(false)
  }

  it should "report false when the Puzzles API rejects the credentials" in {
    clientAnswering(401)._1.hasAccess("id", "Bearer t").futureValue should be(false)
    clientAnswering(403)._1.hasAccess("id", "Bearer t").futureValue should be(false)
  }

  it should "fail on an invalid body or any other upstream status, so it is not mistaken for a denial" in {
    clientAnswering(200, Json.obj("unexpected" -> 1))._1.hasAccess("id", "Bearer t").failed.futureValue
    clientAnswering(500)._1.hasAccess("id", "Bearer t").failed.futureValue
    clientAnswering(404)._1.hasAccess("id", "Bearer t").failed.futureValue
  }
}
