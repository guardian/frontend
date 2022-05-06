package football

import org.scalatest.freespec.AnyFreeSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import play.api.test._
import play.api.test.Helpers._
import test.{ConfiguredTestSuite, WithMaterializer, WithTestWsClient}

@DoNotDiscover class SiteControllerTest
    extends AnyFreeSpec
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
