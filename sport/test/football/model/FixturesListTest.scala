package football.model

import org.scalatest.{DoNotDiscover, OptionValues}
import implicits.Football
import pa.{Fixture, FootballMatch, MatchDay}
import model.Competition
import org.scalatest.freespec.AnyFreeSpec
import org.scalatest.matchers.should.Matchers
import test.ConfiguredTestSuite

import java.time.format.DateTimeFormatter

@DoNotDiscover class FixturesListTest
    extends AnyFreeSpec
    with Matchers
    with MatchTestData
    with Football
    with OptionValues
    with ConfiguredTestSuite {

  "the all fixtures list" - {
    "for today" - {
      val fixtures = FixturesList(today, competitions.competitions)

      "should be showing the correct matches from the test data" in {
        fixtures.relevantMatches
          .map {
            case (fmatch, _) =>
              fmatch.id
          }
          .sortBy(_.toInt) should equal(List("7", "8", "9", "10", "32", "33", "34"))
      }

      "should group matches correctly by date" in {
        fixtures.matchesGroupedByDateAndCompetition.map(_._1) should equal(
          List(today, today.plusDays(1), today.plusDays(3)),
        )
      }

      "should only contain matches happening on one of next 3 days that have fixtures (includes today)" in {
        val allowedDates = List(today, today.plusDays(1), today.plusDays(3)) // look at the test data to see why

        fixtures.relevantMatches.foreach {
          case (fMatch, _) =>
            allowedDates should contain(fMatch.date.toLocalDate)
        }
      }

      "matches should be ordered by datetime" in {
        val matchDates = fixtures.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isBefore(match2Date)))
      }

      "should only show fixtures" in {
        fixtures.relevantMatches.foreach(checkIsFixture)
      }

      "matches should have the correct, populated, competition alongside" in {
        fixtures.relevantMatches.foreach {
          case (fMatch, comp) =>
            if (fMatch.id.toInt < 30) comp.id should equal("500")
            else comp.id should equal("100")
        }
      }
    }

    "for a day in the future (paginated)" - {
      val targetDate = today.plusDays(3)
      val fixtures = FixturesList(targetDate, competitions.competitions)

      "should be showing the correct matches from the test data" in {
        fixtures.relevantMatches
          .map {
            case (fmatch, _) =>
              fmatch.id
          }
          .sortBy(_.toInt) should equal(List("10", "11", "12", "35", "36"))
      }

      "should show matches that appear on three days thereafter, inclusive" in {
        val allowedDates =
          List(targetDate, targetDate.plusDays(1), targetDate.plusDays(7)) // look at the test data to see why

        fixtures.relevantMatches.foreach {
          case (fMatch, _) =>
            allowedDates should contain(fMatch.date.toLocalDate)
        }
      }

      "matches should be ordered by datetime" in {
        val matchDates = fixtures.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isBefore(match2Date)))
      }

      "should only show fixtures" in {
        fixtures.relevantMatches.foreach(checkIsFixture)
      }

      "matches should have the correct, populated, competition alongside" in {
        fixtures.relevantMatches.foreach {
          case (fMatch, comp) =>
            if (fMatch.id.toInt < 30) comp.id should equal("500")
            else comp.id should equal("100")
        }
      }
    }

    "should paginate correctly" - {
      "for today" - {
        val fixtures = FixturesList(today, competitions.competitions)

        "should find correct value for 'nextPage'" in {
          val expectedDate = today.plusDays(4) // see test data
          fixtures.nextPage.value should equal(
            "/football/fixtures/more/" + expectedDate.format(DateTimeFormatter.ofPattern("yyyy/MMM/dd")),
          )
        }

        "should find correct value for 'prevPage'" in {
          fixtures.previousPage should be(None)
        }
      }

      "for tomorrow" - {
        val fixtures = FixturesList(today.plusDays(1), competitions.competitions)

        "should find correct value for 'nextPage'" in {
          val expectedDate = today.plusDays(10) // see test data
          fixtures.nextPage.value should equal(
            "/football/fixtures/more/" + expectedDate.format(DateTimeFormatter.ofPattern("yyyy/MMM/dd")),
          )
        }

        "should find correct value for 'prevPage'" in {
          val expectedDate = today // see test data
          fixtures.previousPage.value should equal(
            "/football/fixtures/" + expectedDate.format(DateTimeFormatter.ofPattern("yyyy/MMM/dd")),
          )
        }
      }

      "for a date with no matches" - {
        val fixtures = FixturesList(today.plusDays(2), competitions.competitions)

        "should find correct value for 'nextPage'" in {
          val expectedDate = today.plusDays(11) // see test data
          fixtures.nextPage.value should equal(
            "/football/fixtures/more/" + expectedDate.format(DateTimeFormatter.ofPattern("yyyy/MMM/dd")),
          )
        }
      }
    }
  }

  "the competition fixtures list" - {
    "given competition 500" - {
      val fixtures = CompetitionFixturesList(today, competitions.competitions, "500")

      "should be showing the correct matches from the test data" in {
        fixtures.relevantMatches
          .map {
            case (fmatch, _) =>
              fmatch.id
          }
          .sortBy(_.toInt) should equal(List("7", "8", "9", "10", "11", "12", "13"))
      }

      "matches should be ordered by datetime" in {
        val matchDates = fixtures.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isBefore(match2Date)))
      }

      "should only show fixtures" in {
        fixtures.relevantMatches.foreach(checkIsFixture)
      }

      "matches should only come from the specified competition" in {
        fixtures.relevantMatches.foreach {
          case (fMatch, comp) =>
            comp.id should equal("500")
        }
      }
    }

    "given competition 100" - {
      val fixtures = CompetitionFixturesList(today, competitions.competitions, "100")

      "should be showing the correct matches from the test data" in {
        fixtures.relevantMatches
          .map {
            case (fmatch, _) =>
              fmatch.id
          }
          .sortBy(_.toInt) should equal(List("32", "33", "34", "35", "36"))
      }

      "matches should only come from the specified competition" in {
        fixtures.relevantMatches.foreach {
          case (fMatch, comp) =>
            comp.id should equal("100")
        }
      }
    }
  }

  "the team fixtures list" - {
    "given spurs" - {
      val fixtures = TeamFixturesList(today, competitions.competitions, spurs.id)

      "should be showing the correct matches from the test data" in {
        fixtures.relevantMatches
          .map {
            case (fmatch, _) =>
              fmatch.id
          }
          .sortBy(_.toInt) should equal(List("7", "11", "12", "36"))
      }

      "matches should be ordered by datetime" in {
        val matchDates = fixtures.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isBefore(match2Date)))
      }

      "should only show fixtures" in {
        fixtures.relevantMatches.foreach(checkIsFixture)
      }

      "matches should only come from the specified team" in {
        fixtures.relevantMatches.foreach {
          case (fMatch, _) =>
            fMatch.hasTeam(spurs.id) should equal(true)
        }
      }
    }
  }

  def checkIsFixture: Function1[(FootballMatch, Competition), Unit] = {
    case (fMatch: Fixture, _) =>
    case (fMatch: MatchDay, _) =>
      if ("-" != fMatch.matchStatus) fail(s"$fMatch is not a fixture (status is ${fMatch.matchStatus})")
    case (fMatch, _) => fail(s"$fMatch was not a fixture")
  }
}
