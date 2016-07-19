package test

import controllers.HealthCheck
import model.commercial._
import model.commercial.books._
import org.scalatest.Suites

class CommercialTestSuite extends Suites (
  new controllers.commercial.TravelOffersControllerTest,
  new MagentoBestsellersFeedTest,
  new books.MagentoExceptionTest,
  new jobs.JobTest,
  new events.EventbriteMasterclassFeedParsingTest,
  new events.SingleEventbriteMasterclassParsingTest,
  new soulmates.SoulmatesFeedTest,
  new LookupTest,
  new BookFinderTest,
  new BookTest
  ) with SingleServerSuite {

  override lazy val port: Int = new HealthCheck().testPort
}
