package football.model

import org.scalatest.{FreeSpec, path, ShouldMatchers}
import org.joda.time.{DateTime, DateMidnight}
import implicits.Football
import pa.{Fixture, MatchDay}


class FixturesListTest extends FreeSpec with ShouldMatchers with MatchTestData with Football {

  "the all fixtures list" - {
    "for today" - {
      val fixtures = new FixturesList(today, competitions)

      "should be showing the correct matches from the test data" in {
        fixtures.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("7", "8", "9", "10", "32", "33", "34"))
      }

      "should only contain matches happening on one of next 3 days that have fixtures (includes today)" in {
        val allowedDates = List(today, today.plusDays(1), today.plusDays(3))  // look at the test data to see why

        fixtures.relevantMatches.foreach { case (fMatch, _) =>
          allowedDates should contain(fMatch.date.toDateMidnight)
        }
      }

      "matches should be ordered by datetime" in {
        val matchDates = fixtures.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isBefore(match2Date)))
      }

      "should only show fixtures" in {
        fixtures.relevantMatches.foreach {
          case (fMatch: Fixture, _) =>
          case (fMatch: MatchDay, _) => if ("-" != fMatch.matchStatus) fail(s"$fMatch is not a fixture (status is ${fMatch.matchStatus}})")
          case (fMatch, _) => fail(s"$fMatch was not a fixture")
        }
      }

      "matches should have the correct, populated, competition alongside" in {
        fixtures.relevantMatches.foreach { case (fMatch, comp) =>
          if (fMatch.id.toInt < 30) comp.id should equal("1")
          else comp.id should equal("2")
        }
      }
    }

    "for a day in the future (paginated)" - {
      val targetDate = today.plusDays(3)
      val fixtures = new FixturesList(targetDate, competitions)

      "should be showing the correct matches from the test data" in {
        fixtures.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("10", "11", "12", "35", "36"))
      }

      "should show matches that appear on three days thereafter, inclusive" in {
        val allowedDates = List(targetDate, targetDate.plusDays(1), targetDate.plusDays(7))  // look at the test data to see why

        fixtures.relevantMatches.foreach { case (fMatch, _) =>
          allowedDates should contain(fMatch.date.toDateMidnight)
        }
      }

      "matches should be ordered by datetime" in {
        val matchDates = fixtures.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isBefore(match2Date)))
      }

      "should only show fixtures" in {
        fixtures.relevantMatches.foreach {
          case (fMatch: Fixture, _) =>
          case (fMatch: MatchDay, _) => if ("-" != fMatch.matchStatus) fail(s"$fMatch is not a fixture (status is ${fMatch.matchStatus}})")
          case (fMatch, _) => fail(s"$fMatch was not a fixture")
        }
      }

      "matches should have the correct, populated, competition alongside" in {
        fixtures.relevantMatches.foreach { case (fMatch, comp) =>
          if (fMatch.id.toInt < 30) comp.id should equal("1")
          else comp.id should equal("2")
        }
      }
    }
  }

  "the competition fixtures list" - {
    "given competition 1" - {
      val fixtures = new CompetitionFixturesList(today, competitions, "1")

      "should be showing the correct matches from the test data" in {
        fixtures.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("7", "8", "9", "10"))
      }

      "should only contain matches happening on one of next 3 days that have fixtures (includes today)" in {
        val allowedDates = List(today, today.plusDays(1), today.plusDays(3))  // look at the test data to see why

        fixtures.relevantMatches.foreach { case (fMatch, _) =>
          allowedDates should contain(fMatch.date.toDateMidnight)
        }
      }

      "matches should be ordered by datetime" in {
        val matchDates = fixtures.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isBefore(match2Date)))
      }

      "should only show fixtures" in {
        fixtures.relevantMatches.foreach {
          case (fMatch: Fixture, _) =>
          case (fMatch: MatchDay, _) => if ("-" != fMatch.matchStatus) fail(s"$fMatch is not a fixture (status is ${fMatch.matchStatus}})")
          case (fMatch, _) => fail(s"$fMatch was not a fixture")
        }
      }

      "matches should only come from the specified competition" in {
        fixtures.relevantMatches.foreach { case (fMatch, comp) =>
          comp.id should equal("1")
        }
      }
    }

    "given competition 2" - {
      val fixtures = new CompetitionFixturesList(today, competitions, "2")

      "should be showing the correct matches from the test data" in {
        fixtures.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("32", "33", "34", "35"))
      }

      "matches should only come from the specified competition" in {
        fixtures.relevantMatches.foreach { case (fMatch, comp) =>
          comp.id should equal("2")
        }
      }
    }
  }

  "the team fixtures list" - {
    "give spurs" - {
      val fixtures = new TeamFixturesList(today, competitions, spurs.id)

      "should be showing the correct matches from the test data" in {
        fixtures.relevantMatches.map { case (fmatch, _) =>
          fmatch.id
        }.sortBy(_.toInt) should equal(List("7", "11", "12", "36"))
      }

      "should only contain matches happening on one of next 3 days that have fixtures (includes today)" in {
        val allowedDates = List(today, today.plusDays(4), today.plusDays(10))  // look at the test data to see why

        fixtures.relevantMatches.foreach { case (fMatch, _) =>
          allowedDates should contain(fMatch.date.toDateMidnight)
        }
      }

      "matches should be ordered by datetime" in {
        val matchDates = fixtures.relevantMatches.map { case (fMatch, _) => fMatch.date }
        matchDates should equal(matchDates.sortWith((match1Date, match2Date) => match1Date.isBefore(match2Date)))
      }

      "should only show fixtures" in {
        fixtures.relevantMatches.foreach {
          case (fMatch: Fixture, _) =>
          case (fMatch: MatchDay, _) => if ("-" != fMatch.matchStatus) fail(s"$fMatch is not a fixture (status is ${fMatch.matchStatus}})")
          case (fMatch, _) => fail(s"$fMatch was not a fixture")
        }
      }

      "matches should only come from the specified team" in {
        fixtures.relevantMatches.foreach { case (fMatch, _) =>
          fMatch.hasTeam(spurs.id) should be(true)
        }
      }
    }
  }
}
