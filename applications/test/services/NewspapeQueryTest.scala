package services

import org.joda.time.{DateTime, DateTimeZone}
import org.scalatest._
import test.ConfiguredTestSuite

@DoNotDiscover class NewspapeQueryTest extends FreeSpec with ShouldMatchers with ConfiguredTestSuite with implicits.Dates{

  "NewspapeQueryTest" - {
    "lowercase display name except UK news and US news" in {
      NewspaperQuery.lowercaseDisplayName("International") should be("international")
      NewspaperQuery.lowercaseDisplayName("UK news") should be("UK news")
      NewspaperQuery.lowercaseDisplayName("US news") should be("US news")
    }

    "use past Sunday date for a given day (required for /theobserver)" in {
      NewspaperQuery.getPastSundayDateFor(new DateTime(2015, 11, 19, 0, 0).withZone(DateTimeZone.UTC)).toISODateTimeString should be("2015-11-15T00:00:00.000Z")
    }

    "use Saturday date if day is Sunday (required for /theguardian)" in {
      NewspaperQuery.getLatestGuardianPageFor(new DateTime(2015, 11, 15, 0, 0).withZone(DateTimeZone.UTC)).toISODateTimeString should be("2015-11-14T00:00:00.000Z")
    }

    "use current date (if not a Sunday) (required /theguardian)" in {
      NewspaperQuery.getLatestGuardianPageFor(new DateTime(2015, 11, 17, 0, 0).withZone(DateTimeZone.UTC)).toISODateTimeString should be("2015-11-17T00:00:00.000Z")
    }
  }
}
