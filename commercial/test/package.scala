package test

import org.scalatest.Suites
import model.commercial._

class CommercialTestSuite extends Suites (
  new services.CommercialHealthcheckTest,
  new controllers.commercial.TravelOffersTest,
  new books.BestsellersApiTest,
  new books.BookTest,
  new books.MagentoExceptionTest,
  new jobs.JobsApiTest,
  new jobs.JobTest,
  new masterclasses.EventbriteMasterClassFeedParsingTest,
  new masterclasses.SingleEventbriteMasterClassParsingTest,
  new money.CreditCardsApiTest,
  new money.CurrentAccountsApiTest,
  new money.MortgagesApiTest,
  new money.SavingsApiTest,
  new soulmates.SoulmatesFeedTest,
  new travel.TravelOffersApiTest,
  new LookupTest
  ) with SingleServerSuite {

  override lazy val port: Int = conf.HealthCheck.testPort
}
