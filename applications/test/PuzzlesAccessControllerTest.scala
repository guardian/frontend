package test

import controllers.{PuzzlesAccessApi, PuzzlesAccessController}
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito.{verify, verifyNoInteractions, when}
import org.scalatest.DoNotDiscover
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.Json
import play.api.mvc.AnyContentAsEmpty
import play.api.test.FakeRequest
import play.api.test.Helpers._

import scala.concurrent.{ExecutionContext, Future}

@DoNotDiscover class PuzzlesAccessControllerTest
    extends AnyFlatSpec
    with Matchers
    with MockitoSugar
    with ScalaFutures
    with WithTestApplicationContext {

  private val puzzleId = "guardian-sudoku-easy-20261009"

  private def controller(api: PuzzlesAccessApi) = new PuzzlesAccessController(api, stubControllerComponents())

  private def request(
      authorization: Option[String] = Some("Bearer reader-token"),
  ): FakeRequest[AnyContentAsEmpty.type] = {
    val base = FakeRequest("GET", s"/puzzles-and-games/access?puzzleId=$puzzleId")
    authorization.fold(base)(value => base.withHeaders(AUTHORIZATION -> value))
  }

  private def apiAnswering(hasAccess: Future[Boolean]): PuzzlesAccessApi = {
    val api = mock[PuzzlesAccessApi]
    when(api.hasAccess(any[String], any[String])(any[ExecutionContext])).thenReturn(hasAccess)
    api
  }

  "access" should "forward the puzzle id and the reader's Authorization header and answer hasAccess" in {
    val api = apiAnswering(Future.successful(true))

    val result = controller(api).access(puzzleId)(request())

    status(result) should be(OK)
    Json.parse(contentAsString(result)) should be(Json.obj("hasAccess" -> true))
    header(CACHE_CONTROL, result).getOrElse("") should include("no-cache")
    verify(api).hasAccess(eqTo(puzzleId), eqTo("Bearer reader-token"))(any[ExecutionContext])
  }

  it should "answer hasAccess false when the Puzzles API denies access" in {
    val result = controller(apiAnswering(Future.successful(false))).access(puzzleId)(request())

    status(result) should be(OK)
    Json.parse(contentAsString(result)) should be(Json.obj("hasAccess" -> false))
  }

  it should "reject a request without an Authorization header without calling the API" in {
    val api = mock[PuzzlesAccessApi]

    val result = controller(api).access(puzzleId)(request(authorization = None))

    status(result) should be(UNAUTHORIZED)
    verifyNoInteractions(api)
  }

  it should "reject a malformed puzzle id without calling the API" in {
    val api = mock[PuzzlesAccessApi]

    val result = controller(api).access("../not valid")(request())

    status(result) should be(BAD_REQUEST)
    verifyNoInteractions(api)
  }

  it should "answer 502 when the Puzzles API fails, so the browser can tell it from a denial" in {
    val api = apiAnswering(Future.failed(new RuntimeException("boom")))

    val result = controller(api).access(puzzleId)(request())

    status(result) should be(BAD_GATEWAY)
  }

  "isValidPuzzleId" should "accept Puzzles API ids and refuse anything else" in {
    PuzzlesAccessController.isValidPuzzleId("guardian-sudoku-easy-20261009") should be(true)
    PuzzlesAccessController.isValidPuzzleId("") should be(false)
    PuzzlesAccessController.isValidPuzzleId("a" * 101) should be(false)
    PuzzlesAccessController.isValidPuzzleId("id with spaces") should be(false)
    PuzzlesAccessController.isValidPuzzleId("id?x=1") should be(false)
  }
}
