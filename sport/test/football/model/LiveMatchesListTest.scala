package football.model

import org.scalatest._
import implicits.Football
import pa.{MatchDay, Result, FootballMatch}
import model.Competition

class LiveMatchesListTest extends FreeSpec with ShouldMatchers with MatchTestData with Football with OptionValues {
  "the live matches list" - {
    val matches = new LiveMatchesList(competitions)

    "should be showing the live matches from the test data" in {
      matches.relevantMatches.map { case (fmatch, _) =>
        fmatch.id
      }.sortBy(_.toInt) should equal(List("5", "6", "31"))
    }

    "matches should be ordered by datetime" in {
      val matchDates = matches.relevantMatches.map { case (fMatch, _) => fMatch.date }
      matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isBefore(match2Date)))
    }


    "should only show live matches" in {
      matches.relevantMatches.foreach(checkIsLive)
    }

    "should not have a next page" in {
      matches.nextPage should be(None)
    }

    "should not have a previous page" in {
      matches.previousPage should be(None)
    }
  }

  def checkIsLive: Function1[(FootballMatch, Competition), Unit] = {
    case (matchDay: MatchDay, _) =>
    case (matchDay, _) => fail(s"$matchDay is not a live match")
  }
}
