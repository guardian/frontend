package feed

import common.AkkaSupport
import akka.actor.Cancellable
import feed.CompetitionAgent
import org.joda.time.DateMidnight
import conf.FootballClient
import akka.util.Duration
import java.util.concurrent.TimeUnit._
import model.Competition
import scala.Some

trait Competitions extends AkkaSupport {

  private var schedules: Seq[Cancellable] = Nil

  private val competitions = Seq(

    CompetitionAgent(Competition("500", "/football/championsleague", "Champions League", "Champions League")),
    CompetitionAgent(Competition("510", "/football/uefa-europa-league", "Europa League", "Europa League")),

    CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League")),
    CompetitionAgent(Competition("101", "/football/championship", "Championship", "Championship")),
    CompetitionAgent(Competition("102", "/football/leagueonefootball", "League One", "League One")),
    CompetitionAgent(Competition("103", "/football/leaguetwofootball", "League Two", "League Two")),
    CompetitionAgent(Competition("127", "/football/fa-cup", "FA Cup", "FA Cup")),

    CompetitionAgent(Competition("120", "/football/scottishpremierleague", "Scottish Premier League", "Scottish Premier League")),
    CompetitionAgent(Competition("121", "/football/scottish-division-one", "Scottish Division One", "Scottish Division One")),
    CompetitionAgent(Competition("122", "/football/scottish-division-two", "Scottish Division Two", "Scottish Division Two")),
    CompetitionAgent(Competition("123", "/football/scottish-division-three", "Scottish Division Three", "Scottish Division Three")),

    CompetitionAgent(Competition("301", "/football/capital-one-cup", "Capital One Cup", "Capital One Cup")),
    CompetitionAgent(Competition("213", "/football/community-shield", "Community Shield", "Community Shield"))
  )

  def withFixturesOrResultsOn(date: DateMidnight) = competitions.map { c =>
    c.competition.copy(fixtures = c.fixturesOn(date), results = c.resultsOn(date))
  }.filter(c => c.hasResults || c.hasFixtures)

  def nextDateWithFixturesFrom(date: DateMidnight): Option[DateMidnight] = {
    competitions.flatMap(_.fixtures)
      .map(_.fixtureDate.toDateMidnight).distinct
      .sortBy(_.getMillis)
      .find(_.isAfter(date))
  }

  def previousDateWithFixturesFrom(date: DateMidnight): Option[DateMidnight] = {

    val candidateDays = competitions.flatMap(_.fixtures)
      .map(_.date.toDateMidnight)
      .distinct
      .sortBy(_.getMillis).reverse
      .filter(_.isBefore(date))
      .take(3).toList

    //the days may not be contiguous so it takes a bit of massaging to find the right one
    candidateDays match {
      case Nil => None
      case head :: tail => (head :: (tail.filter(_.isAfter(head.minusDays(3))))).lastOption
      case other => other.headOption
    }
  }

  private def refreshCompetitionData() = FootballClient.competitions.foreach { season =>
    competitions.find(_.competition.id == season.id).foreach { agent =>
      agent.update(agent.competition.copy(startDate = Some(season.startDate)))
      agent.refresh()
    }
  }

  def refresh() = competitions.foreach(_.refresh())

  def startup() {
    import play_akka.scheduler._
    schedules =
      every(Duration(5, MINUTES)) { refreshCompetitionData() } ::
        every(Duration(2, MINUTES), initialDelay = Duration(5, SECONDS)) { refresh() } ::
        Nil
  }

  def shutDown() {
    schedules.foreach(_.cancel())
    competitions.foreach(_.shutdown())
  }

  def warmup() {
    refreshCompetitionData()
    refresh()
    competitions.foreach(_.await())
  }
}

object Competitions extends Competitions