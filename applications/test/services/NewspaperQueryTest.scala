package services

import org.joda.time.{DateTime, DateTimeZone}
import org.scalatest._
import org.scalatest.freespec.AnyFreeSpec
import org.scalatest.matchers.should.Matchers
import test.{ConfiguredTestSuite, WithMaterializer, WithTestContentApiClient, WithTestWsClient}

@DoNotDiscover class NewspaperQueryTest
    extends AnyFreeSpec
    with Matchers
    with ConfiguredTestSuite
    with implicits.Dates
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestContentApiClient {

  lazy val newspaperQuery = new NewspaperQuery(testContentApiClient)

  "NewspapeQueryTest" - {
    "use past Sunday date for a given day (required for /theobserver)" in {
      newspaperQuery
        .getPastSundayDateFor(new DateTime(2015, 11, 19, 0, 0).withZone(DateTimeZone.UTC))
        .toISODateTimeString should be("2015-11-15T00:00:00.000Z")
    }

    "ensure Sunday date is used for a Sunday date (required for /theobserver)" in {
      newspaperQuery
        .getPastSundayDateFor(new DateTime(2015, 11, 8, 0, 0).withZone(DateTimeZone.UTC))
        .toISODateTimeString should be("2015-11-08T00:00:00.000Z")
    }

    "use Saturday date if day is Sunday (required for /theguardian)" in {
      newspaperQuery
        .getLatestGuardianPageFor(new DateTime(2015, 11, 15, 0, 0).withZone(DateTimeZone.UTC))
        .toISODateTimeString should be("2015-11-14T00:00:00.000Z")
    }

    "use current date (if not a Sunday) (required /theguardian)" in {
      newspaperQuery
        .getLatestGuardianPageFor(new DateTime(2015, 11, 17, 0, 0).withZone(DateTimeZone.UTC))
        .toISODateTimeString should be("2015-11-17T00:00:00.000Z")
    }
  }
}
