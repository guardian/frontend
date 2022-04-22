package controllers.front

import akka.util.Timeout
import common.facia.FixtureBuilder
import model.Cached.RevalidatableResult
import org.scalatest.funsuite.AnyFunSuite
import org.scalatest.matchers.should.Matchers
import play.api.test.Helpers

import scala.concurrent.duration._
import scala.concurrent.Future
import scala.language.postfixOps

class FrontHeadlineTest extends AnyFunSuite with Matchers {
  implicit val timeout: Timeout = Timeout(5 seconds)

  test("renderEmailHeadline extracts headline from pressed page") {
    val pressedPage = FixtureBuilder.mkPressedPage(
      List(
        FixtureBuilder.mkPressedCollection(
          id = "1",
          curated = (1 to 4).map(FixtureBuilder.mkContent),
          backfill = (5 to 8).map(FixtureBuilder.mkContent),
          maxItemsToDisplay = Some(8),
        ),
      ),
    )

    val RevalidatableResult(result, _) = FrontHeadline.renderEmailHeadline(pressedPage)
    val resultFuture = Future.successful(result)
    val headline = Helpers.contentAsString(resultFuture)
    val status = Helpers.status(resultFuture)

    headline shouldBe "webTitle 1"
    status shouldBe 200
  }
}
