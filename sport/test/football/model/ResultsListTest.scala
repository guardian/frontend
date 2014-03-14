package football.model

import org.scalatest._
import implicits.Football
import pa.{FootballMatch, Result, MatchDay}
import model.Competition

class ResultsListTest extends FreeSpec with ShouldMatchers with MatchTestData with Football with OptionValues {
  "the all results list" - {
    "for today" - {
      val results = new ResultsList(today, competitions)

      "should be showing the correct matches from the test data" in {
        results.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("2", "3", "4", "30"))
      }

      "should only contain matches that happened on one of previous 3 days that have fixtures (includes today)" in {
        val allowedDates = List(today, today.minusDays(1), today.minusDays(2))  // look at the test data to see why

        results.relevantMatches.foreach { case (fMatch, _) =>
          allowedDates should contain(fMatch.date.toDateMidnight)
        }
      }

      "matches should be *reverse* ordered by datetime" in {
        val matchDates = results.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isAfter(match2Date)))
      }

      "should only show results" in {
        results.relevantMatches.foreach(checkIsResult)
      }

      "matches should have the correct, populated, competition alongside" in {
        results.relevantMatches.foreach { case (fMatch, comp) =>
          if (fMatch.id.toInt < 30) comp.id should equal("1")
          else comp.id should equal("2")
        }
      }

      "should find correct value for 'nextPage'" in {
        val expectedDate = today.minusDays(5) // see test data
        results.nextPage.value should equal("/football/results/" + expectedDate.toString("yyyy/MMM/dd"))
      }

      "should find nothing for 'prevPage'" in {
        results.previousPage should be(None)
      }
    }

    "the day after results" - {
      val results = new ResultsList(today.plusDays(1), competitions)

      "should be showing the correct matches from the test data" in {
        results.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("2", "3", "4", "30"))
      }

      "should only contain matches that happened on one of previous 3 days that have results" in {
        val allowedDates = List(today, today.minusDays(1), today.minusDays(2))  // look at the test data to see why

        results.relevantMatches.foreach { case (fMatch, _) =>
          allowedDates should contain(fMatch.date.toDateMidnight)
        }
      }

      "should find correct value for 'nextPage'" in {
        val expectedDate = today.minusDays(5) // see test data
        results.nextPage.value should equal("/football/results/" + expectedDate.toString("yyyy/MMM/dd"))
      }

      "should find nothing for 'prevPage'" in {
        results.previousPage should be(None)
      }
    }
  }

  "the competition results list" - {
    "given test competition '1'" - {
      val results = new CompetitionResultsList(today, competitions, "1")

      "should be showing the correct matches from the test data" in {
        results.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("1", "2", "3", "4"))
      }

      "matches should be ordered by datetime" in {
        val matchDates = results.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isAfter(match2Date)))
      }

      "should only show results" in {
        results.relevantMatches.foreach(checkIsResult)
      }

      "matches should only come from the specified competition" in {
        results.relevantMatches.foreach { case (fMatch, comp) =>
          comp.id should equal("1")
        }
      }
    }

    "given test competition '2'" - {
      val results = new CompetitionResultsList(today, competitions, "2")

      "should be showing the correct matches from the test data" in {
        results.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("30"))
      }

      "matches should only come from the specified competition" in {
        results.relevantMatches.foreach { case (fMatch, comp) =>
          comp.id should equal("2")
        }
      }
    }
  }

  "the team results list" - {
    val results = new TeamResultsList(today, competitions, spurs.id)

    "should be showing the correct matches from the test data" in {
      results.relevantMatches.map { case (fmatch, _) =>
        fmatch.id
      }.sortBy(_.toInt) should equal(List("1", "4"))
    }

    "matches should be ordered by datetime" in {
      val matchDates = results.relevantMatches.map { case (fMatch, _) => fMatch.date }
      matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isAfter(match2Date)))
    }

    "should only show fixtures" in {
      results.relevantMatches.foreach(checkIsResult)
    }

    "matches should only come from the specified team" in {
      results.relevantMatches.foreach { case (fMatch, _) =>
        fMatch.hasTeam(spurs.id) should equal(true)
      }
    }
  }

  def checkIsResult: Function1[(FootballMatch, Competition), Unit] = {
    case (fMatch: Result, _) =>
    case (fMatch: MatchDay, _) => if (!fMatch.result) fail(s"$fMatch is not a result (status is ${fMatch.matchStatus})")
    case (fMatch, _) => fail(s"$fMatch was not a result")
  }
}
