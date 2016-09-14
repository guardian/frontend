package services

import org.joda.time.{DateTime, DateTimeZone}
import org.scalatest._
import test.{ConfiguredTestSuite, WithTestContentApiClient, WithTestWsClient}

@DoNotDiscover class NewspaperQueryTest
  extends FreeSpec
  with ShouldMatchers
  with ConfiguredTestSuite
  with implicits.Dates
  with BeforeAndAfterAll
  with WithTestWsClient
  with WithTestContentApiClient {

  lazy val newspaperQuery = new NewspaperQuery(testContentApiClient)

  "NewspapeQueryTest" - {
    "lowercase display name except UK news and US news" in {
      newspaperQuery.lowercaseDisplayName("International") should be("international")
      newspaperQuery.lowercaseDisplayName("UK news") should be("UK news")
      newspaperQuery.lowercaseDisplayName("US news") should be("US news")
    }

    "use past Sunday date for a given day (required for /theobserver)" in {
      newspaperQuery.getPastSundayDateFor(new DateTime(2015, 11, 19, 0, 0).withZone(DateTimeZone.UTC)).toISODateTimeString should be("2015-11-15T00:00:00.000Z")
    }

    "ensure Sunday date is used for a Sunday date (required for /theobserver)" in {
      newspaperQuery.getPastSundayDateFor(new DateTime(2015, 11, 8, 0, 0).withZone(DateTimeZone.UTC)).toISODateTimeString should be("2015-11-08T00:00:00.000Z")
    }

    "use Saturday date if day is Sunday (required for /theguardian)" in {
      newspaperQuery.getLatestGuardianPageFor(new DateTime(2015, 11, 15, 0, 0).withZone(DateTimeZone.UTC)).toISODateTimeString should be("2015-11-14T00:00:00.000Z")
    }

    "use current date (if not a Sunday) (required /theguardian)" in {
      newspaperQuery.getLatestGuardianPageFor(new DateTime(2015, 11, 17, 0, 0).withZone(DateTimeZone.UTC)).toISODateTimeString should be("2015-11-17T00:00:00.000Z")
    }
  }
}
