package test

import model.commercial._
import model.commercial.books._
import org.scalatest.Suites

class CommercialTestSuite extends Suites (
  new services.CommercialHealthcheckTest,
  new controllers.commercial.TravelOffersTest,
  new MagentoBestsellersFeedTest,
  new books.MagentoExceptionTest,
  new jobs.JobTest,
  new events.EventbriteMasterclassFeedParsingTest,
  new events.SingleEventbriteMasterclassParsingTest,
  new money.CreditCardsFeedTest,
  new money.CurrentAccountsFeedTest,
  new money.SavingsFeedTest,
  new soulmates.SoulmatesFeedTest,
  new travel.TravelOffersApiTest,
  new LookupTest,
  new BookFinderTest,
  new BookTest
  ) with SingleServerSuite {

  override lazy val port: Int = conf.HealthCheck.testPort
}
