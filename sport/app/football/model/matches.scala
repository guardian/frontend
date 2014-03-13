package football.model

import feed.CompetitionSupport
import org.joda.time.{Interval, DateTime, DateMidnight}
import model.Competition
import pa.FootballMatch
import implicits.Football
import football.collections.RichList


trait MatchesList extends Football with RichList {
  // container for all competitions
  val competitions: CompetitionSupport

  val baseUrl: String
  val pageType: String

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
  lazy val matchesGroupedByDate = relevantMatches.segmentBy(key = _._1.date.toDateMidnight)
  lazy val matchesGroupedByDateAndCompetition = matchesGroupedByDate.map { case (d, ms) =>
    (d, ms.groupBy(_._2).mapValues(_.map {
      case (matches, _) => matches
    }))
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
  override val pageType = "fixtures"
  // ordering for the displayed matches
  override def timeComesFirstInList(d: DateTime, other: DateTime): Boolean = d.isBefore(other)
}
trait Results extends MatchesList {
  override val baseUrl: String = "/football/results"
  override val pageType = "results"
  override def timeComesFirstInList(d: DateTime, other: DateTime): Boolean = d.isAfter(other)
}
trait MatchDays extends MatchesList {
  override val baseUrl: String = "/football/live"
  override val pageType = "live"
  override val daysToDisplay = 1
  override lazy val nextPage: Option[String] = None
  override lazy val previousPage: Option[String] = None
  override def timeComesFirstInList(d: DateTime, other: DateTime): Boolean = d.isBefore(other)
}
trait TeamList { val teamId: String }
trait CompetitionList {
  val competitions: CompetitionSupport
  val competitionId: String
  lazy val competition = competitions.competitions.find(_.id == competitionId)
}

case class FixturesList(date: DateMidnight, competitions: CompetitionSupport) extends Fixtures {
  override val daysToDisplay = 3
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isFixture
}
case class CompetitionFixturesList(date: DateMidnight, competitions: CompetitionSupport, competitionId: String) extends Fixtures with CompetitionList {
  override val daysToDisplay = 20
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    competition.id == competitionId && fMatch.isFixture
}
case class TeamFixturesList(date: DateMidnight, competitions: CompetitionSupport, teamId: String, daysToDisplay: Int = 20) extends Fixtures with TeamList {
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isFixture && fMatch.hasTeam(teamId)
}

case class ResultsList(date: DateMidnight, competitions: CompetitionSupport) extends Results {
  override val daysToDisplay = 3
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isResult
}
case class CompetitionResultsList(date: DateMidnight, competitions: CompetitionSupport, competitionId: String) extends Results with CompetitionList {
  override val daysToDisplay = 20
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    competition.id == competitionId && fMatch.isResult
}
case class TeamResultsList(date: DateMidnight, competitions: CompetitionSupport, teamId: String) extends Results with TeamList {
  override val daysToDisplay = 20
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isResult && fMatch.hasTeam(teamId)
}

case class MatchDayList(competitions: CompetitionSupport) extends MatchDays {
  override val date = DateMidnight.now
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean = true
}
case class CompetitionMatchDayList(competitions: CompetitionSupport, competitionId: String) extends MatchDays with CompetitionList {
  override val date = DateMidnight.now
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    competition.id == competitionId
}
