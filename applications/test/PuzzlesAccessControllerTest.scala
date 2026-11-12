package test

import controllers.{PuzzleAccess, PuzzlesAccessApi, PuzzlesAccessController}
import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.Json
import play.api.mvc.Result
import play.api.test.FakeRequest
import play.api.test.Helpers._

import java.time.LocalDate
import scala.concurrent.{ExecutionContext, Future}

@DoNotDiscover class PuzzlesAccessControllerTest extends AnyFlatSpec with Matchers with WithTestApplicationContext {

  private val puzzleId = "guardian-sudoku-easy-20261109"
  private val date = "2026-11-09"

  /** A Puzzles API that records what it was asked and answers as told. */
  private class FakeAccessApi(answer: Future[PuzzleAccess]) extends PuzzlesAccessApi {
    var calls: List[(String, LocalDate, String)] = Nil

    override def check(puzzleId: String, date: LocalDate, authorization: String)(implicit
        executionContext: ExecutionContext,
    ): Future[PuzzleAccess] = {
      calls = calls :+ ((puzzleId, date, authorization))
      answer
    }
  }

  private def answering(answer: Future[PuzzleAccess]) = {
    val api = new FakeAccessApi(answer)
    (api, new PuzzlesAccessController(api, stubControllerComponents()))
  }

  private def readerRequest(authorization: String = "Bearer reader-token") =
    FakeRequest("GET", s"/puzzles-and-games/access/$puzzleId/$date")
      .withHeaders(AUTHORIZATION -> authorization)

  private def hasAccess(result: Future[Result]): Boolean =
    (Json.parse(contentAsString(result)) \ "hasAccess").as[Boolean]

  "access" should "answer hasAccess true when the Puzzles API grants access" in {
    val (api, controller) = answering(Future.successful(PuzzleAccess(isPremium = true, hasAccess = true)))

    val result = controller.access(puzzleId, date)(readerRequest())

    status(result) should be(OK)
    hasAccess(result) should be(true)
    api.calls should be(List((puzzleId, LocalDate.of(2026, 11, 9), "Bearer reader-token")))
  }

  it should "answer hasAccess false when the Puzzles API says the reader may not play" in {
    val (_, controller) = answering(Future.successful(PuzzleAccess(isPremium = true, hasAccess = false)))

    val result = controller.access(puzzleId, date)(readerRequest())

    status(result) should be(OK)
    hasAccess(result) should be(false)
  }

  it should "answer only hasAccess, whatever else the Puzzles API said" in {
    val (_, controller) = answering(Future.successful(PuzzleAccess(isPremium = true, hasAccess = true)))

    Json.parse(contentAsString(controller.access(puzzleId, date)(readerRequest()))) should be(
      Json.obj("hasAccess" -> true),
    )
  }

  it should "forward the reader's Authorization header untouched" in {
    val (api, controller) = answering(Future.successful(PuzzleAccess(isPremium = false, hasAccess = true)))

    status(controller.access(puzzleId, date)(readerRequest("Bearer another.token-value"))) should be(OK)

    api.calls.map(_._3) should be(List("Bearer another.token-value"))
  }

  it should "answer 503, never a denial, whenever the Puzzles API could not give an answer" in {
    List[Throwable](
      new RuntimeException("Puzzles access returned HTTP 401"),
      new RuntimeException("Puzzles access returned HTTP 403"),
      new RuntimeException("Puzzles access returned HTTP 404"),
      new RuntimeException("Puzzles access returned HTTP 502"),
      new IllegalArgumentException("Invalid puzzles access response"),
      new java.util.concurrent.TimeoutException("too slow"),
    ).foreach { error =>
      val (_, controller) = answering(Future.failed(error))

      val result = controller.access(puzzleId, date)(readerRequest())

      status(result) should be(SERVICE_UNAVAILABLE)
      contentAsString(result) should not include "hasAccess"
    }
  }

  it should "answer 401 without calling the Puzzles API when there is no Authorization header" in {
    List(
      FakeRequest("GET", "/puzzles-and-games/access"),
      FakeRequest("GET", "/puzzles-and-games/access").withHeaders(AUTHORIZATION -> ""),
      FakeRequest("GET", "/puzzles-and-games/access").withHeaders(AUTHORIZATION -> "   "),
    ).foreach { request =>
      val (api, controller) = answering(Future.successful(PuzzleAccess(isPremium = false, hasAccess = true)))

      status(controller.access(puzzleId, date)(request)) should be(UNAUTHORIZED)
      api.calls should be(Nil)
    }
  }

  it should "answer 400 without calling the Puzzles API for a malformed puzzle id" in {
    List("../state", "a/b", "a b", "a?b=c", "", "a" * 257).foreach { malformed =>
      val (api, controller) = answering(Future.successful(PuzzleAccess(isPremium = false, hasAccess = true)))

      status(controller.access(malformed, date)(readerRequest())) should be(BAD_REQUEST)
      api.calls should be(Nil)
    }
  }

  it should "answer 400 without calling the Puzzles API for a date that is not a calendar day as YYYY-MM-DD" in {
    List("today", "2026-11-32", "2026-02-30", "2026-2-3", "20261109", "2026-11-09T00:00:00Z", "+12026-11-09", "")
      .foreach { malformed =>
        val (api, controller) = answering(Future.successful(PuzzleAccess(isPremium = false, hasAccess = true)))

        status(controller.access(puzzleId, malformed)(readerRequest())) should be(BAD_REQUEST)
        api.calls should be(Nil)
      }
  }

  it should "never be cached, whatever the answer" in {
    val answers = List(
      Future.successful(PuzzleAccess(isPremium = true, hasAccess = true)),
      Future.successful(PuzzleAccess(isPremium = true, hasAccess = false)),
      Future.failed[PuzzleAccess](new RuntimeException("down")),
    )

    answers.foreach { answer =>
      val (_, controller) = answering(answer)

      header(CACHE_CONTROL, controller.access(puzzleId, date)(readerRequest())).getOrElse("") should include(
        "no-store",
      )
    }
    header(
      CACHE_CONTROL,
      answering(Future.successful(PuzzleAccess(isPremium = false, hasAccess = true)))._2
        .access(puzzleId, date)(FakeRequest("GET", "/puzzles-and-games/access")),
    ).getOrElse("") should include("no-store")
  }

  it should "allow an approved origin, and only an approved origin" in {
    val (_, controller) = answering(Future.successful(PuzzleAccess(isPremium = false, hasAccess = true)))
    val approvedOrigin = "http://www.random.com" // Included in the test CORS configuration.

    header(
      "Access-Control-Allow-Origin",
      controller.access(puzzleId, date)(readerRequest().withHeaders("Origin" -> approvedOrigin)),
    ) should be(Some(approvedOrigin))
    header(
      "Access-Control-Allow-Origin",
      controller.access(puzzleId, date)(readerRequest().withHeaders("Origin" -> "https://evil.example.com")),
    ) should be(None)
  }

  "options" should "answer the preflight for GET" in {
    val (_, controller) = answering(Future.successful(PuzzleAccess(isPremium = false, hasAccess = true)))

    status(controller.options(puzzleId, date)(FakeRequest("OPTIONS", s"/puzzles-and-games/access/$puzzleId/$date")))
      .should(be(NO_CONTENT))
  }
}
