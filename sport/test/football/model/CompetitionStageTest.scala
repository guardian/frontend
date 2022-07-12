package football.model

import org.scalatest._
import pa.{Round, Stage}
import org.scalatest.matchers.{BePropertyMatchResult, BePropertyMatcher}

import java.time.ZonedDateTime
import org.scalatest.freespec.AnyFreeSpec
import org.scalatest.matchers.should.Matchers
import test._

@DoNotDiscover class CompetitionStageTest
    extends AnyFreeSpec
    with Matchers
    with OptionValues
    with CompetitionTestData
    with FootballTestData
    with WithTestFootballClient
    with BeforeAndAfterAll
    with ConfiguredTestSuite
    with WithMaterializer
    with WithTestExecutionContext
    with WithTestWsClient {

  lazy val competitionStage = new CompetitionStage(testCompetitionsService.competitions)

  "stagesFromCompetition" - {
    "will generate a League" in {
      val stages = competitionStage.stagesFromCompetition(league)
      stages.length should equal(1)
      stages(0) should be(instanceOf[League])
    }

    "can generate a knockout tournament" in {
      val stages = competitionStage.stagesFromCompetition(tournament)
      stages.length should equal(1)
      stages(0) should be(instanceOfKnockout)
    }

    "can generate a group stage" in {
      val stages = competitionStage.stagesFromCompetition(groupStage)
      stages.length should equal(1)
      stages(0).isInstanceOf[Groups] should equal(true)
    }

    "will generate nothing for a competition that doesn't have useful stages" in {
      val stages = competitionStage.stagesFromCompetition(stageless)
      stages.length should equal(0)
    }

    "for multiple stages" - {

      "will correctly extract group and knockout stage" in {
        val stages = competitionStage.stagesFromCompetition(groupsThenKnockout).toSet
        stages.size should equal(2)
        stages.exists(_.isInstanceOf[Groups]) should equal(true)
        stages.exists(_.isInstanceOf[Knockout]) should equal(true)
      }

      "will correctly extract league and knockout stage" in {
        val stages = competitionStage.stagesFromCompetition(leagueWithPlayoffs).toSet
        stages.size should equal(2)
        stages.exists(_.isInstanceOf[League]) should equal(true)
        stages.exists(_.isInstanceOf[Knockout]) should equal(true)
      }

      "has first stage first if second hasn't yet started" in {
        val inFirstStageOfLeagueKnockout = testCompetition(
          leagueTable = leagueTable(Stage("1"), Round("1", Some("League"))),
          matches = (currentLeagueMatches ++ futureKnockoutMatches(Stage("2"))).sortBy(_.date),
        )
        val stages = competitionStage.stagesFromCompetition(inFirstStageOfLeagueKnockout)
        stages(0) should be(instanceOf[League])
        stages(1) should be(instanceOfKnockout)
      }

      "has second (knockout) stage first if it has started" in {
        val inSecondStageOfLeagueKnockout = testCompetition(
          leagueTable = leagueTable(Stage("1"), Round("1", Some("League"))),
          matches = (pastLeagueMatches ++ currentKnockoutMatches(Stage("2"))).sortBy(_.date),
        )
        val stages = competitionStage.stagesFromCompetition(inSecondStageOfLeagueKnockout)
        stages(0) should be(instanceOfKnockout)
        stages(1) should be(instanceOf[League])
      }
    }

    "for groups" - {
      "adds leagueTableEntries for groups to group stage" in {
        val stages = competitionStage.stagesFromCompetition(groupStage)
        stages(0).asInstanceOf[Groups].groupTables.flatMap(_._2).toSet should equal(groupStage.leagueTable.toSet)
      }

      "if there are multiple stages" - {
        val comp = testCompetition(
          leagueTable = groupTables(Stage("1")) ++ groupTables(Stage("2")),
          matches = currentGroupMatches ++ futureGroupMatches(Stage("2")),
        )
        lazy val stages = competitionStage.stagesFromCompetition(comp)
        lazy val leagueTableEntries0 = stages(0).asInstanceOf[Groups].groupTables.flatMap(_._2).toSet
        lazy val leagueTableEntries1 = stages(1).asInstanceOf[Groups].groupTables.flatMap(_._2).toSet

        "adds correct leagueTableEntries to each group stage if there are multiple stages" in {
          leagueTableEntries0 should equal(comp.leagueTable.filter(_.stageNumber == "1").toSet)
          leagueTableEntries1 should equal(comp.leagueTable.filter(_.stageNumber == "2").toSet)
        }

        "does not add leagueTableEntries for other rounds to group stage" in {
          all(leagueTableEntries0) should have('stageNumber ("1"))
          all(leagueTableEntries1) should have('stageNumber ("2"))
        }

        "can get the matches for a given round" in {
          val testRound = Round("1", Some("Group A"))
          all(stages(0).asInstanceOf[Groups].roundMatches(testRound)) should have('round (testRound))
        }
      }
    }

    "for league" - {
      "adds leagueTableEntries for the league stage" in {
        val stages = competitionStage.stagesFromCompetition(league)
        stages(0).asInstanceOf[League].leagueTable should equal(league.leagueTable)
      }

      "if there are multiple stages" - {
        val comp = testCompetition(
          leagueTable =
            leagueTable(Stage("1"), Round("1", Some("League"))) ++ leagueTable(Stage("2"), Round("1", Some("League"))),
          matches = (pastLeagueMatches ++ futureLeagueMatches(Stage("2"))).sortBy(_.date),
        )
        lazy val stages = competitionStage.stagesFromCompetition(comp)
        lazy val leagueTable0 = stages(0).asInstanceOf[League].leagueTable.toSet
        lazy val leagueTable1 = stages(1).asInstanceOf[League].leagueTable.toSet

        "adds correct leagueTableEntries to each stage if there are multiple stages" in {
          leagueTable0 should equal(comp.leagueTable.filter(_.stageNumber == "1").toSet)
          leagueTable1 should equal(comp.leagueTable.filter(_.stageNumber == "2").toSet)
        }

        "does not add leagueTableEntries for other stages" in {
          all(leagueTable0) should have('stageNumber ("1"))
          all(leagueTable1) should have('stageNumber ("2"))
        }
      }
    }

    "for knockout" - {
      "adds rounds for the stage" in {
        val stages = competitionStage.stagesFromCompetition(tournament)
        stages(0).asInstanceOf[Knockout].rounds.toSet should equal(
          tournament.matches.filter(_.stage == Stage("1")).map(_.round).distinct.toSet,
        )
      }

      "if there are multiple stages" - {
        val comp = testCompetition(
          leagueTable = Nil,
          matches = pastKnockoutMatches(Stage("1")) ++ futureKnockoutMatches(Stage("2")),
        )
        lazy val stages = competitionStage.stagesFromCompetition(comp)
        lazy val rounds0 = stages(0).asInstanceOf[Knockout].rounds.toSet
        lazy val rounds1 = stages(1).asInstanceOf[Knockout].rounds.toSet

        "adds correct rounds to each stage if there are multiple stages" in {
          rounds0 should equal(comp.matches.filter(_.stage == Stage("1")).map(_.round).distinct.toSet)
          rounds1 should equal(comp.matches.filter(_.stage == Stage("2")).map(_.round).distinct.toSet)
        }

        "can get the matches for a given round" in {
          val testRound = Round("1", Some("Quarter Final"))
          all(stages(0).asInstanceOf[Knockout].roundMatches(testRound)) should have('round (testRound))
        }
      }

      "will work out active round as" - {
        "first round if none have started" in {
          val ko = KnockoutList(testCompetitionsService.competitions, futureKnockoutMatches(Stage("1")), knockoutRounds)
          ko.activeRound.value should equal(quarterFinals)
          ko.isActiveRound(quarterFinals) should equal(true)
          ko.isActiveRound(semiFinals) should equal(false)
          ko.isActiveRound(thirdPlacePlayoff) should equal(false)
          ko.isActiveRound(`final`) should equal(false)
        }

        "last round if all have finished" in {
          val ko = KnockoutList(testCompetitionsService.competitions, pastKnockoutMatches(Stage("1")), knockoutRounds)
          ko.activeRound.value should equal(`final`)
          ko.isActiveRound(`final`) should equal(true)
        }

        "current round if we're halfway through one" in {
          val ko =
            KnockoutList(testCompetitionsService.competitions, currentKnockoutMatches(Stage("1")), knockoutRounds)
          ko.activeRound.value should equal(semiFinals)
          ko.isActiveRound(semiFinals) should equal(true)
        }

        "next round if we're between rounds" in {
          val ko =
            KnockoutList(testCompetitionsService.competitions, betweenRoundsKnockoutMatches(Stage("1")), knockoutRounds)
          ko.activeRound.value should equal(thirdPlacePlayoff)
          ko.isActiveRound(thirdPlacePlayoff) should equal(true)
        }
      }

      "will create a spider if a suitable ordering is available" in {
        val matchDates = List(ZonedDateTime.now, ZonedDateTime.now.plusDays(1))
        val orderings = Map("1" -> matchDates)
        val stages = competitionStage.stagesFromCompetition(tournament, orderings)
        stages(0) should be(instanceOf[KnockoutSpider])
        stages(0).asInstanceOf[KnockoutSpider].matchDates should equal(matchDates)
      }

      "creates a knockout list in the absence of a suitable ordering for the competition" in {
        val stages = competitionStage.stagesFromCompetition(tournament)
        stages(0) should be(instanceOf[KnockoutList])
      }

      "creates a knockout list if orderings are provided but do not apply to the provided matches" in {
        val matchDates = tournament.matches.map(_.date.plusYears(1)).toList
        val orderings = Map("1" -> matchDates)
        val stages = competitionStage.stagesFromCompetition(tournament, orderings)
        stages(0) should be(instanceOf[KnockoutList])
      }

      "will de-dupe spider matches based on provided ordering" in {
        // for knockout tournaments PA will delete and then re-issue a ghost/placeholder match when the actual teams become available
        // e.g. final teams are known after semi finals are done
        // this would create duplicate matches since our addMatches code is purely additive, so we must de-dupe matches based on time
        val matches = futureKnockoutMatches(Stage("1"))
        val dates = matches.map(_.date)
        val reissuedMatches = List(
          matches(0).copy(id = "1235"),
          matches(1).copy(id = "1236"),
          matches(2).copy(id = "1237"),
          matches(3).copy(id = "1238"),
        )
        val comp = testCompetition(leagueTable = Nil, matches = futureKnockoutMatches(Stage("1")) ++ reissuedMatches)
        val stages = competitionStage.stagesFromCompetition(comp, Map("1" -> dates))
        val ko = stages(0).asInstanceOf[KnockoutSpider]
        ko should be(instanceOf[KnockoutSpider])
        val qfMatches = ko.roundMatches(quarterFinals)

        qfMatches.map(_.id).toSet should equal(Set("1235", "1236", "1237", "1238"))
      }
    }
  }

  def instanceOf[T](implicit manifest: Manifest[T]): BePropertyMatcher[AnyRef] = {
    new BePropertyMatcher[AnyRef] {
      val clazz = manifest.runtimeClass.asInstanceOf[Class[T]]
      def apply(left: AnyRef) = {
        BePropertyMatchResult(left.getClass.isAssignableFrom(clazz), s"instance of ${clazz.getName}")
      }
    }
  }

  def instanceOfKnockout: BePropertyMatcher[AnyRef] = {
    new BePropertyMatcher[AnyRef] {
      def apply(left: AnyRef) = {
        BePropertyMatchResult(left.isInstanceOf[Knockout], s"instance of League")
      }
    }
  }
}
