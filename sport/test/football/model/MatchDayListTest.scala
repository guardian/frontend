package football.model

import org.scalatest._
import implicits.Football


class MatchDayListTest extends FreeSpec with ShouldMatchers with MatchTestData with Football with OptionValues {
  "the live matches list" - {
    "for today" - {
      val matches = new MatchDayList(competitions, today)

      "should be showing all today's matches from the test data" in {
        matches.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("4", "5", "6", "7", "8", "31", "32", "33"))
      }

      "matches should be ordered by datetime" in {
        val matchDates = matches.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isBefore(match2Date)))
      }

      "should group matches correctly by date" in {
        matches.matchesGroupedByDateAndCompetition.map(_._1) should equal(List(today))
      }

      "should subgroup matches correctly league, with the leagues ordered correctly" in {
        val (_, competitionMatches1) = matches.matchesGroupedByDateAndCompetition(0)
        competitionMatches1.map { case (comp, fMatches) => comp.id } should equal(List("100", "500"))
      }

      "should show all matches happening today" in {
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
          if (fMatch.id.toInt < 30) comp.id should equal("500")
          else comp.id should equal("100")
        }
      }
    }

    "for a specified day in the future" - {
      val matches = new MatchDayList(competitions, today.plusDays(1))

      "should be showing all that day's fixtures from the test data" in {
        matches.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("9", "34"))
      }
    }

    "for a specified day in the past" - {
      val matches = new MatchDayList(competitions, today.minusDays(1))

      "should be showing all that day's results from the test data" in {
        matches.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("3"))
      }
    }

    "if there are no matches on the given day" - {
      val matches = new MatchDayList(competitions, today.minusDays(20))

      "should be empty" in {
        matches.relevantMatches.size should equal(0)
      }
    }
  }

  "the competition group matches" - {
    val matches = new CompetitionGroupMatchesList(competitions, competition1, round2)

    "should get all matches for the specified round and competition" in {
      matches.relevantMatches.map { case (fMatch, _) => fMatch.id } should equal(List("3", "8", "12"))
    }
  }
}
