package commercial.test

import commercial.controllers._
import commercial.model.merchandise._
import commercial.model.capi._
import org.scalatest.{BeforeAndAfterAll, Suites}
import test.{SingleServerSuite, WithTestWsClient}

class CommercialTestSuite extends Suites (
  new TravelOffersControllerTest,
  new books.MagentoBestsellersFeedTest,
  new books.MagentoExceptionTest,
  new jobs.JobTest,
  new events.EventbriteMasterclassFeedParsingTest,
  new events.SingleEventbriteMasterclassParsingTest,
  new soulmates.SoulmatesFeedTest,
  new LookupTest,
  new books.BookFinderTest,
  new books.BookTest
) with SingleServerSuite
  with BeforeAndAfterAll
  with WithTestWsClient {

  override lazy val port: Int = new HealthCheck(wsClient).testPort
}
