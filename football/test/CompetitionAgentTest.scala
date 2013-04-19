package test

import feed.{Competitions, CompetitionAgent}
import model.Competition
import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import scala.concurrent.{Future, Await}
import scala.concurrent.duration._
import conf.FootballClient


class CompetitionAgentTest extends FlatSpec with ShouldMatchers with implicits.Football {

  FootballClient.http = TestHttp

  "CompetitionAgent" should "load fixtures" in Fake {

    object TestCompetitions extends Competitions {
      override val competitionAgents = Seq(
        CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true))
      )
    }

    TestCompetitions.competitionAgents.foreach{ agent =>
      await(agent.refreshFixtures())
      agent.awaitFixtures()
    }

    TestCompetitions.matches.filter(_.isFixture).map(_.id) should contain ("3519484")

    TestCompetitions.shutDown()
  }

  it should "load results" in Fake {

    object TestCompetitions extends Competitions {
      override val competitionAgents = Seq(
        CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true))
      )
    }

    await(TestCompetitions.refreshCompetitionData())

    TestCompetitions.competitionAgents.foreach{ agent =>
      await(agent.refreshResults())
      agent.awaitResults()
    }

    TestCompetitions.matches.filter(_.isResult).map(_.id) should contain ("3528302")

    TestCompetitions.shutDown()
  }

  it should "load live matches" in Fake {

    object TestCompetitions extends Competitions {
      override val competitionAgents = Seq(
        CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true))
      )
    }

    await(TestCompetitions.refreshCompetitionData())
    await(TestCompetitions.refreshMatchDay())

    TestCompetitions.matches.filter(_.isLive).map(_.id) should contain ("3518286")

    TestCompetitions.shutDown()
  }

  it should "load league tables" in Fake {

    object TestCompetitions extends Competitions {
      override val competitionAgents = Seq(
        CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true))
      )
    }

    TestCompetitions.competitionAgents.foreach{ agent =>
      await(agent.refreshLeagueTable())
      agent.awaitLeagueTable()
    }

    await(TestCompetitions.refreshCompetitionData())

    TestCompetitions.competitions(0).leagueTable(0).team.id should be ("4")

    TestCompetitions.shutDown()
  }

  private def await(f: Future[_]) {
    Await.result(f, 10.seconds)
  }
}
