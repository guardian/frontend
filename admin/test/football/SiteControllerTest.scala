package football

import common.ExecutionContexts
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FreeSpec, ShouldMatchers}
import play.api.test._
import play.api.test.Helpers._
import football.services.PaFootballClient
import test.{ConfiguredTestSuite, WithTestWsClient}

@DoNotDiscover class SiteControllerTest
  extends FreeSpec
  with ExecutionContexts
  with ShouldMatchers
  with ConfiguredTestSuite {


  "test index page loads" in {
    val Some(result) = route(FakeRequest(GET, "/admin/football"))
    status(result) should equal(OK)
  }
}
