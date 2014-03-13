package football.model

import org.scalatest._
import implicits.Football
import pa.FootballMatch


class MatchDayListTest extends FreeSpec with ShouldMatchers with MatchTestData with Football with OptionValues {
  "the live matches list" - {
    val matches = new MatchDayList(competitions)

    "should be showing all today's matches from the test data" in {
      matches.relevantMatches.map { case (fmatch, _) =>
        fmatch.id
      }.sortBy(_.toInt) should equal(List("4", "5", "6", "7", "8", "31", "32", "33"))
    }

    "matches should be ordered by datetime" in {
      val matchDates = matches.relevantMatches.map { case (fMatch, _) => fMatch.date }
      matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isBefore(match2Date)))
    }


    "should only show matches happening today" in {
      matches.relevantMatches.foreach { case (fMatch, _) =>
        fMatch.date.toDateMidnight should equal(today)
      }
    }

    "should not have a next page" in {
      matches.nextPage should be(None)
    }

    "should not have a previous page" in {
      matches.previousPage should be(None)
    }

    "matches should have the correct, populated, competition alongside" in {
      matches.relevantMatches.foreach { case (fMatch, comp) =>
        if (fMatch.id.toInt < 30) comp.id should equal("1")
        else comp.id should equal("2")
      }
    }
  }
}
