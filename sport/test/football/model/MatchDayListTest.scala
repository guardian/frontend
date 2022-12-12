package football.model

import org.scalatest._
import implicits.Football
import org.scalatest.freespec.AnyFreeSpec
import org.scalatest.matchers.should.Matchers
import test.ConfiguredTestSuite
import play.api.test.FakeRequest

@DoNotDiscover class MatchDayListTest
    extends AnyFreeSpec
    with Matchers
    with MatchTestData
    with Football
    with OptionValues
    with ConfiguredTestSuite {
  "the live matches list" - {
    "for today" - {
      val matches = MatchDayList(competitions.competitions, today)

      "matches should be ordered by datetime" in {
        val matchDates = matches.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isBefore(match2Date)))
      }

      "should group matches correctly by date" in {
        val request = FakeRequest()
        matches.matchesGroupedByDateAndCompetition(request).map(_._1) should equal(List(today))
      }

      "should subgroup matches correctly league, with the leagues ordered correctly" in {
        val request = FakeRequest()
        val (_, competitionMatches1) = matches.matchesGroupedByDateAndCompetition(request)(0)
        competitionMatches1.map { case (comp, fMatches) => comp.id } should equal(
          List("500", "100"),
        )
      }

      "should show all matches happening today" in {
        matches.relevantMatches.foreach {
          case (fMatch, _) =>
            fMatch.date.toLocalDate should equal(today)
        }
      }

      "should not have a next page" in {
        matches.nextPage should be(None)
      }

      "should not have a previous page" in {
        matches.previousPage should be(None)
      }

      "matches should have the correct, populated, competition alongside" in {
        matches.relevantMatches.foreach {
          case (fMatch, comp) =>
            if (fMatch.id.toInt < 30) comp.id should equal("500")
            else comp.id should equal("100")
        }
      }
    }

    "if there are no matches on the given day" - {
      val matches = MatchDayList(competitions.competitions, today.minusDays(20))

      "should be empty" in {
        matches.relevantMatches.size should equal(0)
      }
    }
  }

  "the competition group matches" - {
    val matches = CompetitionRoundMatchesList(competitions.competitions, competition1, round2)

    "should get all matches for the specified round and competition" in {
      matches.relevantMatches.map { case (fMatch, _) => fMatch.id } should equal(List("3", "8", "12"))
    }
  }
}
