package test

import ab.ABTests
import controllers.{PuzzlesProgressApi, PuzzlesProgressApiResponse, PuzzlesProgressController}
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito.{verify, verifyNoInteractions, when}
import org.scalatest.DoNotDiscover
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.{AnyContentAsJson, Request}
import play.api.test.FakeRequest
import play.api.test.Helpers._

import scala.concurrent.{ExecutionContext, Future}

@DoNotDiscover class PuzzlesProgressControllerTest
    extends AnyFlatSpec
    with Matchers
    with MockitoSugar
    with ScalaFutures
    with WithTestApplicationContext {

  private val update = Json.obj(
    "puzzleId" -> "guardian-sudoku-easy-20260914",
    "puzzleType" -> "SUDOKU_EASY",
    "publishDate" -> "2026-09-14T00:00:00Z",
    "gameStatus" -> "in-progress",
    "progress" -> 75,
    "lastUpdated" -> "2026-09-14T15:30:00Z",
  )

  private def controller(api: PuzzlesProgressApi) =
    new PuzzlesProgressController(api, stubControllerComponents())

  private def request(
      body: JsValue,
      authorization: Option[String] = Some("Bearer reader-token"),
      participations: String = "puzzles-new-hub:variant,puzzles-new-hub-v1:variant",
  ): Request[JsValue] = {
    val base = FakeRequest("PUT", "/puzzles-and-games/progress/save")
      .withHeaders("X-GU-Server-AB-Tests" -> participations)
    val withAuth = authorization.fold(base)(value => base.withHeaders(AUTHORIZATION -> value))
    val decorated = ABTests.decorateRequest("X-GU-Server-AB-Tests")(withAuth)
    withAuth.withAttrs(decorated.attrs).withBody(body)
  }

  private def apiReturning(status: Int, body: Option[JsValue] = None): PuzzlesProgressApi = {
    val api = mock[PuzzlesProgressApi]
    when(api.save(any[String], any[JsValue])(any[ExecutionContext]))
      .thenReturn(Future.successful(PuzzlesProgressApiResponse(status, body)))
    api
  }

  "save" should "forward the updates and the reader's Authorization header, and return 202" in {
    val api = apiReturning(202, Some(Json.obj("data" -> Json.arr(update))))
    val updates = Json.arr(update)

    val result = controller(api).save()(request(updates))

    status(result) should be(202)
    header(CACHE_CONTROL, result) should be(Some("no-store"))
    verify(api).save(eqTo("Bearer reader-token"), eqTo[JsValue](updates))(any[ExecutionContext])
  }

  it should "reject a request without an Authorization header without calling the API" in {
    val api = mock[PuzzlesProgressApi]

    val result = controller(api).save()(request(Json.arr(update), authorization = None))

    status(result) should be(401)
    verifyNoInteractions(api)
  }

  it should "reject a body that is not an array of 1 to 100 updates without calling the API" in {
    val api = mock[PuzzlesProgressApi]

    status(controller(api).save()(request(update))) should be(400)
    status(controller(api).save()(request(Json.arr()))) should be(400)
    status(controller(api).save()(request(JsArrayOf(101)))) should be(400)
    verifyNoInteractions(api)
  }

  it should "not be available outside the puzzles hub v1 experiment" in {
    val api = mock[PuzzlesProgressApi]

    val result = controller(api).save()(request(Json.arr(update), participations = "puzzles-new-hub:control"))

    status(result) should be(404)
    verifyNoInteractions(api)
  }

  it should "pass through validation errors from the API" in {
    val api = apiReturning(400, Some(Json.obj("message" -> "Invalid request body")))

    val result = controller(api).save()(request(Json.arr(update)))

    status(result) should be(400)
    contentAsJson(result) should be(Json.obj("message" -> "Invalid request body"))
  }

  it should "map upstream 401 and 403 to 401 without leaking details" in {
    Seq(401, 403).foreach { upstream =>
      val result = controller(apiReturning(upstream, Some(Json.obj("secret" -> "x")))).save()(request(Json.arr(update)))

      status(result) should be(401)
      contentAsJson(result) should be(Json.obj("message" -> "Not authorised"))
    }
  }

  it should "map any other upstream failure to 502" in {
    val result = controller(apiReturning(500, Some(Json.obj("error" -> "boom")))).save()(request(Json.arr(update)))

    status(result) should be(502)
    contentAsJson(result) should be(Json.obj("message" -> "Failed to save progress"))
  }

  it should "map an exception from the API client to 502" in {
    val api = mock[PuzzlesProgressApi]
    when(api.save(any[String], any[JsValue])(any[ExecutionContext]))
      .thenReturn(Future.failed(new RuntimeException("timeout")))

    status(controller(api).save()(request(Json.arr(update)))) should be(502)
  }

  private def JsArrayOf(size: Int): JsValue = Json.toJson(Seq.fill(size)(update))
}
