package football.model

import org.scalatest.{OptionValues, FreeSpec}
import org.scalatest.ShouldMatchers
import pa.{Fixture, Round, Stage}
import org.scalatest.matchers.{BePropertyMatchResult, BePropertyMatcher}
import org.joda.time.DateTime
import org.scalatest.exceptions.TestFailedException

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
      stages(0) should be (instanceOfKnockout)
    }

    "can generate a group stage" in {
      val stages = CompetitionStage.stagesFromCompetition(groupStage)
      stages.length should equal(1)
      stages(0).isInstanceOf[Groups] should equal(true)
    }

    "will generate nothing for a competition that doesn't have useful stages" in {
      val stages = CompetitionStage.stagesFromCompetition(stageless)
      stages.length should equal(0)
    }

    "for multiple stages" - {

      "will correctly extract group and knockout stage" in {
        val stages = CompetitionStage.stagesFromCompetition(groupsThenKnockout).toSet
        stages.size should equal(2)
        stages.exists(_.isInstanceOf[Groups]) should equal(true)
        stages.exists(_.isInstanceOf[Knockout]) should equal(true)
      }

      "will correctly extract league and knockout stage" in {
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
        stages(1) should be (instanceOfKnockout)
      }

      "has second (knockout) stage first if it has started" in {
        val inSecondStageOfLeagueKnockout = testCompetition(
          leagueTable = leagueTable(Stage("1"), Round("1", Some("League"))),
          matches = (pastLeagueMatches ++ currentKnockoutMatches(Stage("2"))).sortBy(_.date)
        )
        val stages = CompetitionStage.stagesFromCompetition(inSecondStageOfLeagueKnockout)
        stages(0) should be (instanceOfKnockout)
        stages(1) should be (instanceOf[League])
      }
    }

    "for groups" - {
      "adds leagueTableEntries for groups to group stage" in {
        val stages = CompetitionStage.stagesFromCompetition(groupStage)
        stages(0).asInstanceOf[Groups].groupTables.map(_._2).flatten.toSet should equal (groupStage.leagueTable.toSet)
      }

      "if there are multiple stages" - {
        val comp = testCompetition(
          leagueTable = groupTables(Stage("1")) ++ groupTables(Stage("2")),
          matches = currentGroupMatches ++ futureGroupMatches(Stage("2"))
        )
        val stages = CompetitionStage.stagesFromCompetition(comp)
        val leagueTableEntries0 = stages(0).asInstanceOf[Groups].groupTables.map(_._2).flatten.toSet
        val leagueTableEntries1 = stages(1).asInstanceOf[Groups].groupTables.map(_._2).flatten.toSet

        "adds correct leagueTableEntries to each group stage if there are multiple stages" in {
          leagueTableEntries0 should equal (comp.leagueTable.filter(_.stageNumber == "1").toSet)
          leagueTableEntries1 should equal (comp.leagueTable.filter(_.stageNumber == "2").toSet)
        }

        "does not add leagueTableEntries for other rounds to group stage" in {
          all (leagueTableEntries0) should have('stageNumber ("1"))
          all (leagueTableEntries1) should have('stageNumber ("2"))
        }

        "can get the matches for a given round" in {
          val testRound = Round("1", Some("Group A"))
          all (stages(0).asInstanceOf[Groups].roundMatches(testRound)) should have('round (testRound))
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
          all (stages(0).asInstanceOf[Knockout].roundMatches(testRound)) should have('round (testRound))
        }
      }

      "will work out active round as" - {
        "first round if none have started" in {
          val ko = KnockoutList(futureKnockoutMatches(Stage("1")), knockoutRounds)
          ko.activeRound.value should equal(quarterFinals)
          ko.isActiveRound(quarterFinals) should equal(true)
          ko.isActiveRound(semiFinals) should equal(false)
          ko.isActiveRound(thirdPlacePlayoff) should equal(false)
          ko.isActiveRound(`final`) should equal(false)
        }

        "last round if all have finished" in {
          val ko = KnockoutList(pastKnockoutMatches(Stage("1")), knockoutRounds)
          ko.activeRound.value should equal(`final`)
          ko.isActiveRound(`final`) should equal(true)
        }

        "current round if we're halfway through one" in {
          val ko = KnockoutList(currentKnockoutMatches(Stage("1")), knockoutRounds)
          ko.activeRound.value should equal(semiFinals)
          ko.isActiveRound(semiFinals) should equal(true)
        }

        "next round if we're between rounds" in {
          val ko = KnockoutList(betweenRoundsKnockoutMatches(Stage("1")), knockoutRounds)
          ko.activeRound.value should equal(thirdPlacePlayoff)
          ko.isActiveRound(thirdPlacePlayoff) should equal(true)
        }
      }
    }
  }

  "World Cup 2014 wallchart spider can sort based on the hard-coded match datetimes" - {
    def m(id: String, date: DateTime, roundNumber: String) =
      Fixture(id, date, Stage("2"), Round(roundNumber, None), "1", teams(0), teams(1), None, None)
    def dt(month: Int, day: Int, hour: Int, minute: Int) = new DateTime(2014, month, day, hour, minute)
    val wcMatches = List(
      m("1", dt(6, 28, 17, 0), "1"),
      m("2", dt(6, 28, 21, 0), "1"),
      m("3", dt(6, 29, 17, 0), "1"),
      m("4", dt(6, 29, 21, 0), "1"),
      m("5", dt(6, 30, 17, 0), "1"),
      m("6", dt(6, 30, 21, 0), "1"),
      m("7", dt(7, 1, 17, 0), "1"),
      m("8", dt(7, 1, 21, 0), "1"),
      m("9", dt(7, 4, 17, 0), "2"),
      m("10", dt(7, 4, 21, 0), "2"),
      m("12", dt(7, 5, 17, 0), "2"),
      m("11", dt(7, 5, 21, 0), "2"),
      m("13", dt(7, 8, 21, 0), "3"),
      m("14", dt(7, 9, 21, 0), "3"),
      m("15", dt(7, 12, 21, 0), "4"),
      m("16", dt(7, 13, 20, 0), "5")
    )
    val rounds = List(Round("1", None), Round("2", None), Round("3", None), Round("4", None), Round("5", None))
    val wcWallchart = KnockoutSpider(wcMatches, rounds,
      KnockoutSpider.orderings.get("700").getOrElse(throw new TestFailedException("No ordering available for world cup", 3))
    )

    "will return correctly sorted matches for WC2014 round of 16" in {
      wcWallchart.roundMatches(Round("1", None)).map(_.id) should equal(List("1", "2", "5", "6", "3", "4", "7", "8"))
    }

    "will return correctly sorted matches for WC2014 quarter finals" in {
      wcWallchart.roundMatches(Round("2", None)).map(_.id) should equal(List("10", "9", "11", "12"))
    }

    "will return correctly sorted matches for WC2014 semi-finals" in {
      wcWallchart.roundMatches(Round("3", None)).map(_.id) should equal(List("13", "14"))
    }
  }

  def instanceOf[T](implicit manifest: Manifest[T]) = {
    new BePropertyMatcher[AnyRef] {
      val clazz = manifest.runtimeClass.asInstanceOf[Class[T]]
      def apply(left: AnyRef) = {
        BePropertyMatchResult(left.getClass.isAssignableFrom(clazz), s"instance of ${clazz.getName}")
      }
    }
  }

  def instanceOfKnockout = {
    new BePropertyMatcher[AnyRef] {
      def apply(left: AnyRef) = {
        BePropertyMatchResult(left.isInstanceOf[Knockout], s"instance of League")
      }
    }
  }
}
