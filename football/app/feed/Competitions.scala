package feed

import common.{ Logging, AkkaSupport }
import akka.actor.Cancellable
import org.joda.time.{ DateTime, DateTimeComparator, DateMidnight }
import conf.FootballClient
import model.Competition
import model.TeamFixture
import scala.Some
import java.util.Comparator
import org.scala_tools.time.Imports._
import pa.{MatchDay, MatchDayTeam, FootballTeam, FootballMatch}
import implicits.Football
import common._

import play.api.libs.concurrent.Execution.Implicits._
import scala.concurrent.duration.{Duration => Timed, _}

trait CompetitionSupport extends Football {

  private implicit val dateMidnightOrdering = Ordering.comparatorToOrdering(
    DateTimeComparator.getInstance.asInstanceOf[Comparator[DateMidnight]]
  )

  def competitions: Seq[Competition]

  def withMatchesOn(date: DateMidnight) = competitionSupportWith {
    val competitionsWithMatches = competitions.filter(_.matches.exists(_.isOn(date)))
    competitionsWithMatches.map(c => c.copy(matches = c.matches.filter(_.isOn(date))))
  }

  def withCompetitionFilter(path: String) = competitionSupportWith(
    competitions.filter(_.url == path)
  )

  def withTag(tag: String) = competitions.find(_.url.endsWith(tag))

  def withId(compId: String) = competitions.find(_.id == compId)

  def withTodaysMatchesAndFutureFixtures = competitionSupportWith {
    val today = new DateMidnight
    competitions.map(c => c.copy(matches = c.matches.filter(m => m.isFixture || m.isOn(today)))).filter(_.hasMatches)
  }

  def withTodaysMatchesAndPastResults = competitionSupportWith {
    val today = new DateMidnight
    competitions.map(c => c.copy(matches = c.matches.filter(m => m.isResult || m.isOn(today)))).filter(_.hasMatches)
  }

  def withTodaysMatches = competitionSupportWith {
    val today = new DateMidnight
    competitions.map(c => c.copy(matches = c.matches.filter(_.isOn(today)))).filter(_.hasMatches)
  }

  def withTeam(team: String) = competitionSupportWith {
    competitions.filter(_.hasLeagueTable).filter(_.leagueTable.exists(_.team.id == team))
  }

  def matchDates = competitions.flatMap(_.matchDates).distinct.sorted

  def nextMatchDates(startDate: DateMidnight, numDays: Int) = matchDates.filter(_ >= startDate).take(numDays)

  def previousMatchDates(date: DateMidnight, numDays: Int) = matchDates.reverse.filter(_ <= date).take(numDays)

  def findMatch(id: String): Option[FootballMatch] = competitions.flatMap(_.matches.find(_.id == id)).headOption

  def withTeamMatches(teamId: String) = competitions.filter(_.hasMatches).flatMap(c =>
    c.matches.filter(m => m.homeTeam.id == teamId || m.awayTeam.id == teamId).sortBy(_.date.getMillis).map { m =>
      TeamFixture(c, m)
    }
  )

  def findTeam(teamId: String): Option[FootballTeam] = competitions.flatMap(_.teams).find(_.id == teamId).map { unclean =>
    MatchDayTeam(teamId, unclean.name, None, None, None, None)
  }

  def matchFor(date: DateMidnight, homeTeamId: String, awayTeamId: String) = withMatchesOn(date).matches
    .find(m => m.homeTeam.id == homeTeamId && m.awayTeam.id == awayTeamId)

  // note team1 & team2 are the home and away team, but we do NOT know their order
  def matchFor(interval: Interval, team1: String, team2: String): Option[FootballMatch] = matches
    .filter(m => interval.contains(m.date))
    .find(m => m.hasTeam(team1) && m.hasTeam(team2))

  def matches = competitions.flatMap(_.matches).sortBy(_.date.millis)

  private def competitionSupportWith(comps: Seq[Competition]) = new CompetitionSupport {
    def competitions = comps
  }
}







trait Competitions extends CompetitionSupport with AkkaSupport with Logging with implicits.Collections with Football {

  private implicit val dateOrdering = Ordering.comparatorToOrdering(
    DateTimeComparator.getInstance.asInstanceOf[Comparator[DateTime]]
  )

  private var schedules: Seq[Cancellable] = Nil

  val competitionAgents = Seq(

    CompetitionAgent(Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true)),

    CompetitionAgent(Competition("500", "/football/championsleague", "Champions League", "Champions League", "European")),

    CompetitionAgent(Competition("510", "/football/uefa-europa-league", "Europa League", "Europa League", "European")),

    CompetitionAgent(Competition("300", "/football/fa-cup", "FA Cup", "FA Cup", "English")),

    CompetitionAgent(Competition("301", "/football/capital-one-cup", "Capital One Cup", "Capital One Cup", "English")),

    CompetitionAgent(Competition("101", "/football/championship", "Championship", "Championship", "English", showInTeamsList = true)),

    CompetitionAgent(Competition("102", "/football/leagueonefootball", "League One", "League One", "English", showInTeamsList = true)),

    CompetitionAgent(Competition("103", "/football/leaguetwofootball", "League Two", "League Two", "English", showInTeamsList = true)),

    CompetitionAgent(Competition("213", "/football/community-shield", "Community Shield", "Community Shield", "English")),

    CompetitionAgent(Competition("120", "/football/scottishpremierleague", "Scottish Premier League", "Scottish Premier League", "Scottish", showInTeamsList = true)),

    CompetitionAgent(Competition("121", "/football/scottish-division-one", "Scottish Division One", "Scottish Division One", "Scottish", showInTeamsList = true)),

    CompetitionAgent(Competition("122", "/football/scottish-division-two", "Scottish Division Two", "Scottish Division Two", "Scottish", showInTeamsList = true)),

    CompetitionAgent(Competition("123", "/football/scottish-division-three", "Scottish Division Three", "Scottish Division Three", "Scottish", showInTeamsList = true)),

    CompetitionAgent(Competition("320", "/football/scottishcup", "Scottish Cup", "Scottish Cup", "Scottish")),

    CompetitionAgent(Competition("321", "/football/cis-insurance-cup", "Scottish League Cup", "Scottish League Cup", "Scottish")),

    CompetitionAgent(Competition("701", "/football/world-cup-2014-qualifiers", "World Cup 2014 qualifiers", "World Cup 2014 qualifiers", "Internationals")),

    CompetitionAgent(Competition("721", "/football/friendlies", "International friendlies", "Friendlies", "Internationals")),

    CompetitionAgent(Competition("650", "/football/laligafootball", "La Liga", "La Liga", "European", showInTeamsList = true)),

    CompetitionAgent(Competition("620", "/football/ligue1football", "Ligue 1", "Ligue 1", "European", showInTeamsList = true)),

    CompetitionAgent(Competition("625", "/football/bundesligafootball", "Bundesliga", "Bundesliga", "European", showInTeamsList = true)),

    CompetitionAgent(Competition("635", "/football/serieafootball", "Serie A", "Serie A", "European", showInTeamsList = true))

  )

  override def competitions = competitionAgents.map { agent =>

    val results = agent.results

    //results trump live games
    val resultsWithLiveGames = agent.liveMatches.filterNot(g => results.exists(_.id == g.id)) ++ results

    //results and live games trump fixtures
    val allGames = agent.fixtures.filterNot(f => resultsWithLiveGames.exists(_.id == f.id)) ++ resultsWithLiveGames

    val distinctGames = allGames.distinctBy(_.id).sortBy(m => (m.date.minuteOfDay().get(), m.homeTeam.name))

    agent.competition.copy(
      matches = distinctGames,
      leagueTable = agent.leagueTable
    )
  }

  //one http call updates all competitions
  def refreshCompetitionData() = FootballClient.competitions.map(_.flatMap{ season =>
    log.info("Refreshing competition data")
    competitionAgents.find(_.competition.id == season.id).map { agent =>
      val newCompetition = agent.competition.copy(startDate = Some(season.startDate))
      agent.update(newCompetition)
      newCompetition
    }
  })

  //one http call updates all competitions
  def refreshMatchDay() = FootballClient.matchDay(DateMidnight.now).map{ todaysMatches: List[MatchDay] =>

    val liveMatches = todaysMatches.filter(_.isLive)
    val results = todaysMatches.filter(_.isResult)
    competitionAgents.map { agent =>

      //update the results of the competition
      val competitionResults = results.filter(_.competition.exists(_.id == agent.competition.id))
      agent.addResultsFromMatchDay(competitionResults)

      //update the live matches of the competition
      val competitionLiveMatches = liveMatches.filter(_.competition.exists(_.id == agent.competition.id))
      log.info(s"found ${competitionLiveMatches.size} live matches for competition ${agent.competition.fullName}")
      agent.updateLiveMatches(competitionLiveMatches)
    }
  }

  def startup() {
    import play_akka.scheduler._
    schedules = every(Timed(10, SECONDS), initialDelay = Timed(1, SECONDS)) { refreshMatchDay() } ::
      every(Timed(5, MINUTES), initialDelay = Timed(1, SECONDS)) { refreshCompetitionData() } ::
      competitionAgents.zipWithIndex.toList.map {
        case (agent, index) =>
          //stagger fixtures and results refreshes to avoid timeouts
          every(Timed(5, MINUTES), initialDelay = Timed(5 + index, SECONDS)) { agent.refresh() }
      }
  }

  def shutDown() {
    schedules.foreach(_.cancel())
    competitionAgents.foreach(_.shutdown())
  }

  //used to add test data
  def setMatches(competitionId: String, matches: Seq[FootballMatch]) {
    competitionAgents.find(_.competition.id == competitionId).foreach(_.setMatches(matches))
  }
}

object Competitions extends Competitions