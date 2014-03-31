import common.ExecutionContexts
import org.scalatest.{ShouldMatchers, FreeSpec}
import play.api.test._
import play.api.test.Helpers._
import scala.concurrent.{Await, Future}
import football.services.GetPaClient
import test.Fake


class SiteControllerTest extends FreeSpec with GetPaClient with ExecutionContexts with ShouldMatchers {

  "test index page loads" in Fake {
    val Some(result) = route(FakeRequest(GET, "/admin/football"))
    status(result) should equal(OK)
  }
}
