package test

import model.commercial._
import model.commercial.books.MagentoBestsellersFeedTest
import org.scalatest.Suites

class CommercialTestSuite extends Suites (
  new services.CommercialHealthcheckTest,
  new controllers.commercial.TravelOffersTest,
  new MagentoBestsellersFeedTest,
  new books.MagentoExceptionTest,
  new jobs.JobTest,
  new masterclasses.EventbriteMasterClassFeedParsingTest,
  new masterclasses.SingleEventbriteMasterClassParsingTest,
  new money.CreditCardsFeedTest,
  new money.CurrentAccountsFeedTest,
  new money.SavingsFeedTest,
  new soulmates.SoulmatesFeedTest,
  new travel.TravelOffersApiTest,
  new LookupTest
  ) with SingleServerSuite {

  override lazy val port: Int = conf.HealthCheck.testPort
}
