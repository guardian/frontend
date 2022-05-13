package football.model

import org.scalatest._
import implicits.Football
import pa.{FootballMatch, MatchDay, Result}
import model.Competition
import org.scalatest.freespec.AnyFreeSpec
import org.scalatest.matchers.should.Matchers
import test.ConfiguredTestSuite

@DoNotDiscover class ResultsListTest
    extends AnyFreeSpec
    with Matchers
    with MatchTestData
    with Football
    with OptionValues
    with ConfiguredTestSuite {
  "the all results list" - {
    "for today" - {
      val results = ResultsList(today, competitions.competitions)

      "matches should be *reverse* ordered by datetime" in {
        val matchDates = results.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isAfter(match2Date)))
      }

      "should only show results" in {
        results.relevantMatches.foreach(checkIsResult)
      }

      "matches should have the correct, populated, competition alongside" in {
        results.relevantMatches.foreach {
          case (fMatch, comp) =>
            if (fMatch.id.toInt < 30) comp.id should equal("500")
            else comp.id should equal("100")
        }
      }

      "should find nothing for 'prevPage'" in {
        results.previousPage should be(None)
      }
    }

    "the day after results" - {
      val results = ResultsList(today.plusDays(1), competitions.competitions)

      "should find nothing for 'prevPage'" in {
        results.previousPage should be(None)
      }
    }
  }

  "the competition results list" - {
    "given test competition '500'" - {
      val results = CompetitionResultsList(today, competitions.competitions, "500")

      "should be showing the correct matches from the test data" in {
        results.relevantMatches
          .map {
            case (fmatch, _) =>
              fmatch.id
          }
          .sortBy(_.toInt) should equal(List("1", "2", "3", "4"))
      }

      "matches should be ordered by datetime" in {
        val matchDates = results.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isAfter(match2Date)))
      }

      "should only show results" in {
        results.relevantMatches.foreach(checkIsResult)
      }

      "matches should only come from the specified competition" in {
        results.relevantMatches.foreach {
          case (fMatch, comp) =>
            comp.id should equal("500")
        }
      }
    }

    "given test competition '100'" - {
      val results = CompetitionResultsList(today, competitions.competitions, "100")

      "should be showing the correct matches from the test data" in {
        results.relevantMatches
          .map {
            case (fmatch, _) =>
              fmatch.id
          }
          .sortBy(_.toInt) should equal(List("30"))
      }

      "matches should only come from the specified competition" in {
        results.relevantMatches.foreach {
          case (fMatch, comp) =>
            comp.id should equal("100")
        }
      }
    }
  }

  "the team results list" - {
    val results = TeamResultsList(today, competitions.competitions, spurs.id)

    "should be showing the correct matches from the test data" in {
      results.relevantMatches
        .map {
          case (fmatch, _) =>
            fmatch.id
        }
        .sortBy(_.toInt) should equal(List("1", "4"))
    }

    "matches should be ordered by datetime" in {
      val matchDates = results.relevantMatches.map { case (fMatch, _) => fMatch.date }
      matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isAfter(match2Date)))
    }

    "should only show results" in {
      results.relevantMatches.foreach(checkIsResult)
    }

    "matches should only come from the specified team" in {
      results.relevantMatches.foreach {
        case (fMatch, _) =>
          fMatch.hasTeam(spurs.id) should equal(true)
      }
    }
  }

  def checkIsResult: Function1[(FootballMatch, Competition), Unit] = {
    case (fMatch: Result, _)   =>
    case (fMatch: MatchDay, _) => if (!fMatch.result) fail(s"$fMatch is not a result (status is ${fMatch.matchStatus})")
    case (fMatch, _)           => fail(s"$fMatch was not a result")
  }
}
