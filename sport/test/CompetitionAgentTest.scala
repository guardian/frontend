package test

import feed.{CompetitionSupport, Competitions, CompetitionAgent}
import model.Competition
import org.scalatest.FlatSpec
import org.scalatest.Matchers
import org.scalatest.concurrent.Eventually
import org.scalatest.time.{Millis, Span}
import org.joda.time.DateMidnight


class CompetitionAgentTest extends FlatSpec with Matchers with implicits.Football with Eventually {

  override implicit lazy val patienceConfig = PatienceConfig(timeout = scaled(Span(3000, Millis)), interval = scaled(Span(100, Millis)))

  lazy val seasonStart = Some(new DateMidnight(2012, 8, 1))

  "CompetitionAgentTest" should "load fixtures" in Fake {

    object TestCompetitions extends Competitions {
      override val competitionAgents = Seq(
        CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true))
      )

      def matches = CompetitionSupport(competitionAgents.map(_.competition)).matches
    }

    TestCompetitions.competitionAgents.foreach(_.refreshFixtures())

    eventually(
      TestCompetitions.matches.filter(_.isFixture).map(_.id) should contain ("3519484")
    )

    TestCompetitions.stop()
  }

  it should "load results" in Fake {

    object TestCompetitions extends Competitions {
      override val competitionAgents = Seq(
        CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true, startDate = seasonStart))
      )
      def matches = CompetitionSupport(competitionAgents.map(_.competition)).matches
    }

    TestCompetitions.competitionAgents.foreach(_.refreshResults())

    eventually(
      TestCompetitions.matches.filter(_.isResult).map(_.id) should contain ("3528302")
    )

    TestCompetitions.stop()
  }

  it should "load live matches" in Fake {

    object TestCompetitions extends Competitions {
      override val competitionAgents = Seq(
        CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true))
      )
      def matches = CompetitionSupport(competitionAgents.map(_.competition)).matches
    }

    TestCompetitions.refreshMatchDay()

    eventually(TestCompetitions.matches.filter(_.isLive).map(_.id) should contain ("3518286"))

    TestCompetitions.stop()
  }

  it should "load league tables" in Fake {

    object TestCompetitions extends Competitions {
      override val competitionAgents = Seq(
        CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true))
      )
      def competitions = competitionAgents.map(_.competition)
    }

    TestCompetitions.competitionAgents.foreach(_.refresh())

    eventually(TestCompetitions.competitions(0).leagueTable(0).team.id should be ("4"))

    TestCompetitions.stop()
  }

}
