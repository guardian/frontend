package feed

import common._
import conf.FootballClient
import java.util.Comparator
import model.Competition
import model.TeamFixture
import org.joda.time.{ DateTimeComparator, DateMidnight }
import org.scala_tools.time.Imports._
import pa._


trait CompetitionSupport extends implicits.Football {

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

  def findMatch(id: String): Option[FootballMatch] = matches.find(_.id == id)

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

trait Competitions extends CompetitionSupport with ExecutionContexts with Logging with implicits.Collections with implicits.Football {

  private implicit val dateOrdering = Ordering.comparatorToOrdering(
    DateTimeComparator.getInstance.asInstanceOf[Comparator[DateTime]]
  )

  val competitionDefinitions = Seq(
    Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true),
    Competition("500", "/football/championsleague", "Champions League", "Champions League", "European"),
    Competition("510", "/football/uefa-europa-league", "Europa League", "Europa League", "European"),
    Competition("300", "/football/fa-cup", "FA Cup", "FA Cup", "English"),
    Competition("301", "/football/capital-one-cup", "Capital One Cup", "Capital One Cup", "English"),
    Competition("101", "/football/championship", "Championship", "Championship", "English", showInTeamsList = true),
    Competition("102", "/football/leagueonefootball", "League One", "League One", "English", showInTeamsList = true),
    Competition("103", "/football/leaguetwofootball", "League Two", "League Two", "English", showInTeamsList = true),
    Competition("400", "/football/community-shield", "Community Shield", "Community Shield", "English", showInTeamsList = true),
    Competition("120", "/football/scottishpremierleague", "Scottish Premier League", "Scottish Premier League", "Scottish", showInTeamsList = true),
    Competition("121", "/football/scottish-division-one", "Scottish Division One", "Scottish Division One", "Scottish", showInTeamsList = true),
    Competition("122", "/football/scottish-division-two", "Scottish Division Two", "Scottish Division Two", "Scottish", showInTeamsList = true),
    Competition("123", "/football/scottish-division-three", "Scottish Division Three", "Scottish Division Three", "Scottish", showInTeamsList = true),
    Competition("320", "/football/scottishcup", "Scottish Cup", "Scottish Cup", "Scottish"),
    Competition("321", "/football/cis-insurance-cup", "Scottish League Cup", "Scottish League Cup", "Scottish"),
    Competition("701", "/football/world-cup-2014-qualifiers", "World Cup 2014 qualifiers", "World Cup 2014 qualifiers", "Internationals"),
    Competition("721", "/football/friendlies", "International friendlies", "Friendlies", "Internationals"),
    Competition("650", "/football/laligafootball", "La Liga", "La Liga", "European", showInTeamsList = true),
    Competition("620", "/football/ligue1football", "Ligue 1", "Ligue 1", "European", showInTeamsList = true),
    Competition("625", "/football/bundesligafootball", "Bundesliga", "Bundesliga", "European", showInTeamsList = true),
    Competition("635", "/football/serieafootball", "Serie A", "Serie A", "European", showInTeamsList = true)
  )

  val competitionAgents = competitionDefinitions map { CompetitionAgent(_) }
  val competitionIds: Seq[String] = competitionDefinitions map { _.id }

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

  def refreshCompetitionAgent(id: String) {
    competitionAgents find { _.competition.id == id } map { _.refresh() }
  }

  //one http call updates all competitions
  def refreshCompetitionData() = FootballClient.competitions.map(_.flatMap{ season =>
    log.info("Refreshing competition data")
    competitionAgents.find(_.competition.id == season.id).map { agent =>
      val newCompetition = agent.competition.copy(startDate = Some(season.startDate))
      agent.update(newCompetition)
    }
  })

  //one http call updates all competitions
  def refreshMatchDay() = {
    log.info("Refreshing match day data")
    FootballClient.matchDay(DateMidnight.now).map{ todaysMatches: List[MatchDay] =>
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
  }

  def stop() {
    competitionAgents.foreach(_.stop())
  }
}

object Competitions extends Competitions