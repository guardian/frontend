package football.model

import org.scalatest.{OptionValues, FreeSpec}
import org.scalatest.ShouldMatchers
import pa.{Round, Stage}
import org.scalatest.matchers.{BePropertyMatchResult, BePropertyMatcher}

class CompetitionStageTest extends FreeSpec with ShouldMatchers with OptionValues with CompetitionTestData {
  "stagesFromCompetition" - {
    "will generate a League" in {
      val stages = CompetitionStage.stagesFromCompetition(league)
      stages.length should equal(1)
      stages(0) should be (instanceOf[League])
    }

    "can generate a knockout tournament" in {
      val stages = CompetitionStage.stagesFromCompetition(tournament)
      stages.length should equal(1)
      stages(0) should be (instanceOf[Knockout])
    }

    "can generate a group stage" in {
      val stages = CompetitionStage.stagesFromCompetition(groupStage)
      stages.length should equal(1)
      stages(0).isInstanceOf[Group] should equal(true)
    }

    "will generate nothing for a competition that doesn't have useful stages" in {
      val stages = CompetitionStage.stagesFromCompetition(stageless)
      stages.length should equal(0)
    }

    "for multiple stages" - {

      "will correctly extract group and knockout stages" in {
        val stages = CompetitionStage.stagesFromCompetition(groupsThenKnockout).toSet
        stages.size should equal(2)
        stages.exists(_.isInstanceOf[Group]) should equal(true)
        stages.exists(_.isInstanceOf[Knockout]) should equal(true)
      }

      "will correctly extract league and knockout stages" in {
        val stages = CompetitionStage.stagesFromCompetition(leagueWithPlayoffs).toSet
        stages.size should equal(2)
        stages.exists(_.isInstanceOf[League]) should equal(true)
        stages.exists(_.isInstanceOf[Knockout]) should equal(true)
      }

      "has first stage first if second hasn't yet started" in {
        val inFirstStageOfLeagueKnockout = testCompetition(
          leagueTable = leagueTable(Stage("1"), Round("1", Some("League"))),
          matches = (currentLeagueMatches ++ futureKnockoutMatches(Stage("2"))).sortBy(_.date)
        )
        val stages = CompetitionStage.stagesFromCompetition(inFirstStageOfLeagueKnockout)
        stages(0) should be (instanceOf[League])
        stages(1) should be (instanceOf[Knockout])
      }

      "has second (knockout) stage first if it has started" in {
        val inSecondStageOfLeagueKnockout = testCompetition(
          leagueTable = leagueTable(Stage("1"), Round("1", Some("League"))),
          matches = (pastLeagueMatches ++ currentKnockoutMatches(Stage("2"))).sortBy(_.date)
        )
        val stages = CompetitionStage.stagesFromCompetition(inSecondStageOfLeagueKnockout)
        stages(0) should be (instanceOf[Knockout])
        stages(1) should be (instanceOf[League])
      }
    }

    "for groups" - {
      "adds leagueTableEntries for groups to group stage" in {
        val stages = CompetitionStage.stagesFromCompetition(groupStage)
        stages(0).asInstanceOf[Group].groupTables.values.flatten.toSet should equal (groupStage.leagueTable.toSet)
      }

      "if there are multiple stages" - {
        val comp = testCompetition(
          leagueTable = groupTables(Stage("1")) ++ groupTables(Stage("2")),
          matches = currentGroupMatches ++ futureGroupMatches(Stage("2"))
        )
        val stages = CompetitionStage.stagesFromCompetition(comp)
        val leagueTableEntries0 = stages(0).asInstanceOf[Group].groupTables.values.flatten.toSet
        val leagueTableEntries1 = stages(1).asInstanceOf[Group].groupTables.values.flatten.toSet

        "adds correct leagueTableEntries to each group stage if there are multiple stages" in {
          leagueTableEntries0 should equal (comp.leagueTable.filter(_.stageNumber == "1").toSet)
          leagueTableEntries1 should equal (comp.leagueTable.filter(_.stageNumber == "2").toSet)
        }

        "does not add leagueTableEntries for other rounds to group stage" in {
          all (leagueTableEntries0) should have('stageNumber ("1"))
          all (leagueTableEntries1) should have('stageNumber ("2"))
        }
      }
    }

    "for league" - {
      "adds leagueTableEntries for the league stage" in {
        val stages = CompetitionStage.stagesFromCompetition(league)
        stages(0).asInstanceOf[League].leagueTable should equal (league.leagueTable)
      }

      "if there are multiple stages" - {
        val comp = testCompetition(
          leagueTable = leagueTable(Stage("1"), Round("1", Some("League"))) ++ leagueTable(Stage("2"), Round("1", Some("League"))),
          matches = (pastLeagueMatches ++ futureLeagueMatches(Stage("2"))).sortBy(_.date)
        )
        val stages = CompetitionStage.stagesFromCompetition(comp)
        val leagueTable0 = stages(0).asInstanceOf[League].leagueTable.toSet
        val leagueTable1 = stages(1).asInstanceOf[League].leagueTable.toSet

        "adds correct leagueTableEntries to each stage if there are multiple stages" in {
          leagueTable0 should equal (comp.leagueTable.filter(_.stageNumber == "1").toSet)
          leagueTable1 should equal (comp.leagueTable.filter(_.stageNumber == "2").toSet)
        }

        "does not add leagueTableEntries for other stages" in {
          all (leagueTable0) should have('stageNumber ("1"))
          all (leagueTable1) should have('stageNumber ("2"))
        }
      }
    }

    "for knockout" - {
      "adds rounds for the stage" in {
        val stages = CompetitionStage.stagesFromCompetition(tournament)
        stages(0).asInstanceOf[Knockout].rounds.toSet should equal(tournament.matches.filter(_.stage == Stage("1")).map(_.round).distinct.toSet)
      }

      "if there are multiple stages" - {
        val comp = testCompetition(
          leagueTable = Nil,
          matches = pastKnockoutMatches(Stage("1")) ++ futureKnockoutMatches(Stage("2"))
        )
        val stages = CompetitionStage.stagesFromCompetition(comp)
        val rounds0 = stages(0).asInstanceOf[Knockout].rounds.toSet
        val rounds1 = stages(1).asInstanceOf[Knockout].rounds.toSet

        "adds correct rounds to each stage if there are multiple stages" in {
          rounds0 should equal (comp.matches.filter(_.stage == Stage("1")).map(_.round).distinct.toSet)
          rounds1 should equal (comp.matches.filter(_.stage == Stage("2")).map(_.round).distinct.toSet)
        }

        "can get the matches for a given round" in {
          val testRound = Round("1", Some("Quarter Final"))
          all (stages(0).asInstanceOf[Knockout].matchesForRound(testRound)) should have('round (testRound))
        }
      }
    }
  }

  def instanceOf[T](implicit manifest: Manifest[T]) = {
    new BePropertyMatcher[AnyRef] {
      val clazz = manifest.runtimeClass.asInstanceOf[Class[T]]
      def apply(left: AnyRef) = BePropertyMatchResult(left.getClass.isAssignableFrom(clazz), s"instance of ${clazz.getName}")
    }
  }
}
