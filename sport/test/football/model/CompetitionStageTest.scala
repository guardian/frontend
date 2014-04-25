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
  }

  def instanceOf[T](implicit manifest: Manifest[T]) = {
    new BePropertyMatcher[AnyRef] {
      val clazz = manifest.runtimeClass.asInstanceOf[Class[T]]
      def apply(left: AnyRef) = BePropertyMatchResult(left.getClass.isAssignableFrom(clazz), s"instance of ${clazz.getName}")
    }
  }
}
