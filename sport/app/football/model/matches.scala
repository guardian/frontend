package football.model

import feed.CompetitionSupport
import org.joda.time.{Interval, DateTime, DateMidnight}
import model.Competition
import pa.FootballMatch
import implicits.Football


trait MatchesList extends Football {
  // container for all competitions
  val competitions: CompetitionSupport
  val baseUrl: String

  val date: DateMidnight
  val daysToDisplay: Int

  def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean

  // ordering for the displayed matches
  def timeComesFirstInList(d: DateTime, other: DateTime): Boolean
  def dateComesFirstInList(d: DateMidnight, other: DateMidnight): Boolean = timeComesFirstInList(d.toDateTime, other.toDateTime)

  private lazy val allRelevantMatches: List[(FootballMatch, Competition)] = {
    val matchesWithCompetition = for {
      competition <- competitions.competitions
      matches = competition
        .matches
        .filter(fMatch => filterMatches(fMatch, competition))
      fMatch <- matches
    } yield (fMatch, competition)
    matchesWithCompetition.sortWith { case ((fMatch1, _), (fMatch2, _)) => timeComesFirstInList(fMatch1.date, fMatch2.date) }
  }
  lazy val matchDates = allRelevantMatches.map { case (fMatch, _) => fMatch.date.toDateMidnight }.distinct
  // the subset of football matches to display for the given date
  lazy val relevantMatches: List[(FootballMatch, Competition)] = {
    val startDate = date
    val matchDates = allRelevantMatches.map { case (fMatch, _) => fMatch.date.toDateMidnight }.distinct
    val eligibleDates = matchDates.dropWhile(dateComesFirstInList(_, startDate)).take(daysToDisplay)
    allRelevantMatches.filter { case (fMatch, _) =>
      eligibleDates.contains(fMatch.date.toDateMidnight)
    }
  }

  lazy val nextPage: Option[String] = {
    val nextMatchDate = matchDates.dropWhile(dateComesFirstInList(_, date)).drop(daysToDisplay).headOption
    nextMatchDate.map(s"$baseUrl/" + _.toString("yyyy/MMM/dd"))
  }
  lazy val previousPage: Option[String] = {
    val nextMatchDate = matchDates.takeWhile(dateComesFirstInList(_, date)).lastOption
    nextMatchDate.map(s"$baseUrl/" + _.toString("yyyy/MMM/dd"))
  }
}

trait Fixtures extends MatchesList {
  override val baseUrl: String = "/football/fixtures"
  // ordering for the displayed matches
  override def timeComesFirstInList(d: DateTime, other: DateTime): Boolean = d.isBefore(other)
}
trait Results extends MatchesList {
  override val baseUrl: String = "/football/results"
  override def timeComesFirstInList(d: DateTime, other: DateTime): Boolean = d.isAfter(other)
}
trait LiveMatches extends MatchesList {
  override val baseUrl: String = "/football/live"
  override val daysToDisplay = 1
  override lazy val nextPage: Option[String] = None
  override lazy val previousPage: Option[String] = None
  override def timeComesFirstInList(d: DateTime, other: DateTime): Boolean = d.isBefore(other)
}

class FixturesList(val date: DateMidnight, val competitions: CompetitionSupport) extends Fixtures {
  override val daysToDisplay = 3
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isFixture
}
class CompetitionFixturesList(val date: DateMidnight, val competitions: CompetitionSupport, competitionId: String) extends Fixtures {
  override val daysToDisplay = 20
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    competition.id == competitionId && fMatch.isFixture
}
class TeamFixturesList(val date: DateMidnight, val competitions: CompetitionSupport, teamId: String) extends Fixtures {
  override val daysToDisplay = 20
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isFixture && fMatch.hasTeam(teamId)
}

class ResultsList(val date: DateMidnight, val competitions: CompetitionSupport) extends Results {
  override val daysToDisplay = 3
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isResult
}
class CompetitionResultsList(val date: DateMidnight, val competitions: CompetitionSupport, competitionId: String) extends Results {
  override val daysToDisplay = 20
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    competition.id == competitionId && fMatch.isResult
}
class TeamResultsList(val date: DateMidnight, val competitions: CompetitionSupport, teamId: String) extends Results {
  override val daysToDisplay = 20
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isResult && fMatch.hasTeam(teamId)
}

class LiveMatchesList(val competitions: CompetitionSupport) extends LiveMatches {
  override val date = DateMidnight.now
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isLive
}
