package feed

import pa._
import conf.FootballClient
import org.joda.time.DateMidnight
import akka.util.Timeout
import common._
import pa.Result
import model.Competition
import pa.Fixture

trait HasCompetition {
  def competition: Competition
}

trait LiveMatchAgent extends AkkaSupport with HasCompetition with Logging {

  private val agent = play_akka.agent[Seq[FootballMatch]](Nil)

  def updateLiveMatches(matches: Seq[FootballMatch]) = agent.update(matches)

  def shutdownLiveMatches() { agent.close() }

  def liveMatches = agent()
}

trait FixtureAgent extends AkkaSupport with HasCompetition with Logging {

  private val agent = play_akka.agent[Seq[Fixture]](Nil)

  def refreshFixtures() {
    agent.sendOff { old =>
      val fixtures = FootballClient.fixtures(competition.id)
      log.info("found %s fixtures for competition %s".format(fixtures.size, competition.fullName))
      fixtures
    }
  }

  def shutdownFixtures() { agent.close() }

  def awaitFixtures() { quietly(agent.await(Timeout(5000))) }

  def fixtures = agent()

  def fixturesOn(date: DateMidnight) = fixtures.filter(_.date.toDateMidnight == date)
}

trait ResultAgent extends AkkaSupport with HasCompetition with Logging {

  private val agent = play_akka.agent[Seq[FootballMatch]](Nil)

  def refreshResults() {

    //it is possible that we do not know the startdate of the competition yet (concurrency)
    //in that case just get the last 30 days results, the start date will catch up soon enough
    val startDate = competition.startDate.getOrElse(new DateMidnight().minusDays(30))

    agent.sendOff { old =>

      //unfortunately we need to poll 2 feeds to get this data correctly
      val resultsToKeep = old.filter {
        case m: MatchDay => true
        case _ => false
      }

      val results = FootballClient.results(competition.id, startDate)
      log.info("found %s results for competition %s".format(results.size, competition.fullName))
      results ++ resultsToKeep
    }
  }

  def addResultsFromMatchDay(matches: Seq[FootballMatch]) {
    agent.send { old =>
      val matchesToKeep = old.filterNot(m => matches.exists(_.id == m.id))
      matchesToKeep ++ matches
    }
  }

  def shutdownResults() { agent.close() }

  def results = agent()

  def awaitResults() { quietly { agent.await(Timeout(5000)) } }

  def resultsOn(date: DateMidnight) = results.filter(_.date.toDateMidnight == date)
}

class CompetitionAgent(_competition: Competition) extends FixtureAgent with ResultAgent with LiveMatchAgent {

  private val agent = play_akka.agent(_competition)

  def competition = agent()

  def update(competition: Competition) { agent.update(competition) }

  def refresh() {
    refreshFixtures()
    refreshResults()
  }

  def shutdown() {
    shutdownFixtures()
    shutdownResults()
    shutdownLiveMatches()
  }

  def await() {
    awaitFixtures()
    awaitResults()
  }
}

object CompetitionAgent {
  def apply(competition: Competition) = new CompetitionAgent(competition)
}