package football.model

import org.scalatest.{path, ShouldMatchers}
import org.joda.time.{DateTime, DateMidnight}


class MatchListsTest extends path.FreeSpec with ShouldMatchers with MatchTestData {

  "all fixtures" - {
    "today" - {
      val list = FixturesList(today, competitions)

      "should show next 3 days with fixtures, includes today" in {
        list.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("4", "5", "6", "7", "8", "9", "10", "31", "32", "33", "34"))
      }
    }
  }

}
