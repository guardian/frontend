package football.model

import feed.CompetitionSupport
import org.joda.time.{Interval, DateTime, DateMidnight}
import model.Competition
import pa.FootballMatch
import implicits.Football


trait MatchesList extends Football {
  // container for all competitions
  val competitions: CompetitionSupport

  val date: DateMidnight
  val daysToDisplay: Int

  def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean

  // ordering for the displayed matches
  def matchLessThan(x: FootballMatch, y: FootballMatch): Boolean

  def previousPage: Option[String]
  def nextPage: Option[String]

  // the subset of football matches to display
  lazy val relevantMatches: List[(FootballMatch, Competition)] = {
    val startDate = date
    val matchesWithCompetition = for {
      competition <- competitions.competitions
      matches = competition
        .matches
        .filter(fMatch => filterMatches(fMatch, competition))
      fMatch <- matches
    } yield (fMatch, competition)
    val sortedMatches = matchesWithCompetition.sortWith { case ((fMatch1, _), (fMatch2, _)) => matchLessThan(fMatch1, fMatch2) }
    val matchDates = sortedMatches.map { case (fMatch, _) => fMatch.date.toDateMidnight }.distinct
    val eligibleDates = matchDates.dropWhile(_ != startDate).take(daysToDisplay)
    sortedMatches.filter { case (fMatch, _) =>
      eligibleDates.contains(fMatch.date.toDateMidnight)
    }
  }
}

trait Fixtures extends MatchesList {
  override val daysToDisplay = 3
  override def nextPage: Option[String] = Some("")
  override def previousPage: Option[String] = Some("")
  override def matchLessThan(x: FootballMatch, y: FootballMatch): Boolean = x.date.isBefore(y.date)
}
trait Results extends MatchesList {
  override val daysToDisplay = 3
  override def nextPage: Option[String] = Some("")
  override def previousPage: Option[String] = Some("")
  override def matchLessThan(x: FootballMatch, y: FootballMatch): Boolean = x.date.isAfter(y.date) // backwards
}
trait LiveMatches extends MatchesList {
  override val daysToDisplay = 1
  override def nextPage: Option[String] = None
  override def previousPage: Option[String] = None
  override def matchLessThan(x: FootballMatch, y: FootballMatch): Boolean = x.date.isBefore(y.date)
}

class FixturesList(val date: DateMidnight, val competitions: CompetitionSupport) extends Fixtures {
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isFixture
}
class CompetitionFixturesList(val date: DateMidnight, val competitions: CompetitionSupport, competitionId: String) extends Fixtures {
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    competition.id == competitionId && fMatch.isFixture
}
class TeamFixturesList(val date: DateMidnight, val competitions: CompetitionSupport, teamId: String) extends Fixtures {
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isFixture && fMatch.hasTeam(teamId)
}

class ResultsList(val date: DateMidnight, val competitions: CompetitionSupport) extends Results {
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isResult
}
class CompetitionResultsList(val date: DateMidnight, val competitions: CompetitionSupport, competitionId: String) extends Results {
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    competition.id == competitionId && fMatch.isFixture
}
class TeamResultsList(val date: DateMidnight, val competitions: CompetitionSupport, teamId: String) extends Results {
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isFixture && fMatch.hasTeam(teamId)
}

class LiveMatchesList(val date: DateMidnight, val competitions: CompetitionSupport) extends LiveMatches {
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isLive
}
class CompetitionLiveMatchesList(val date: DateMidnight, val competitions: CompetitionSupport, competitionId: String) extends LiveMatches {
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    competition.id == competitionId && fMatch.isLive
}
class TeamLiveMatchesList(val date: DateMidnight, val competitions: CompetitionSupport, teamId: String) extends LiveMatches {
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isLive && fMatch.hasTeam(teamId)
}
