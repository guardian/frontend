package test

import feed.{Competitions, CompetitionAgent}
import model.Competition
import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import concurrent.Promise
import concurrent.{Future, Await}
import concurrent.duration._
import conf.FootballClient


class CompetitionAgentTest extends FlatSpec with ShouldMatchers with implicits.Football {


  ignore should "load fixtures" in Fake {

    object TestCompetitions extends Competitions {
      override val competitionAgents = Seq(
        CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true))
      )
    }

    awaitTestData(TestCompetitions)

    TestCompetitions.matches.filter(_.isFixture).map(_.id) should contain ("3519484")

    TestCompetitions.stop()
  }

  ignore should "load results" in Fake {

    object TestCompetitions extends Competitions {
      override val competitionAgents = Seq(
        CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true))
      )
    }

    awaitTestData(TestCompetitions)

    TestCompetitions.matches.filter(_.isResult).map(_.id) should contain ("3528302")

    TestCompetitions.stop()
  }

  ignore should "load live matches" in Fake {

    object TestCompetitions extends Competitions {
      override val competitionAgents = Seq(
        CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true))
      )
    }

    //await(TestCompetitions.refreshCompetitionData()).foreach(await)
    //await(TestCompetitions.refreshMatchDay()).foreach(await)

    TestCompetitions.matches.filter(_.isLive).map(_.id) should contain ("3518286")

    TestCompetitions.stop()
  }

  ignore should "load league tables" in Fake {

    object TestCompetitions extends Competitions {
      override val competitionAgents = Seq(
        CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true))
      )
    }

    //await(TestCompetitions.refreshCompetitionData()).foreach(await)

    TestCompetitions.competitionAgents.foreach{ agent =>
      //await(agent.refreshLeagueTable())
    }

    TestCompetitions.competitions(0).leagueTable(0).team.id should be ("4")

    TestCompetitions.stop()
  }

  private def awaitTestData(competitions: Competitions) {

    val premierAgent = competitions.competitionAgents.find(_.competition.id == "100").head

    competitions.refreshCompetitionData()
    competitions.refreshMatchDay()

    //TODO
    //give test data a chance to load

  }

  private def isTestDataLoaded(comp: Competition) = {
    (comp.hasFixtures && comp.hasLiveMatches && comp.hasResults && comp.hasLeagueTable)
  }
}
