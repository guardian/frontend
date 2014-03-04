package football.model

import org.scalatest.{path, ShouldMatchers}
import org.joda.time.{DateTime, DateMidnight}


class MatchListsTest extends path.FreeSpec with ShouldMatchers with MatchTestData {

  "all fixtures" - {
    "today" - {
      val list = new FixturesList(today, competitions)

      "should show matches happening on any of next 3 days that have fixtures fixtures (includes today)" in {
        list.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("4", "5", "6", "7", "8", "9", "10", "31", "32", "33", "34"))
      }

      "matches should be ordered by datetime" in {
        val matchDates = list.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isBefore(match2Date)))
      }
    }
  }

}
