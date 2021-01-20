package football

import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FreeSpec, Matchers}
import play.api.test._
import play.api.test.Helpers._
import test.{ConfiguredTestSuite, WithMaterializer, WithTestWsClient}

@DoNotDiscover class SiteControllerTest
    extends FreeSpec
    with ConfiguredTestSuite
    with Matchers
    with WithMaterializer
    with BeforeAndAfterAll
    with WithTestWsClient {

  "test index page loads" in {
    val Some(result) = route(app, FakeRequest(GET, "/admin/football"))
    status(result) should equal(OK)
  }
}
