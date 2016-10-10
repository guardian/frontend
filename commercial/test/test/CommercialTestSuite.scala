package commercial.test

import commercial.controllers.HealthCheck
import model.commercial._
import model.commercial.books._
import org.scalatest.{BeforeAndAfterAll, Suites}
import test.{SingleServerSuite, WithTestWsClient}

class CommercialTestSuite extends Suites (
  new commercial.controllers.TravelOffersControllerTest,
  new MagentoBestsellersFeedTest,
  new books.MagentoExceptionTest,
  new jobs.JobTest,
  new events.EventbriteMasterclassFeedParsingTest,
  new events.SingleEventbriteMasterclassParsingTest,
  new soulmates.SoulmatesFeedTest,
  new LookupTest,
  new BookFinderTest,
  new BookTest
) with SingleServerSuite
  with BeforeAndAfterAll
  with WithTestWsClient {

  override lazy val port: Int = new HealthCheck(wsClient).testPort
}
