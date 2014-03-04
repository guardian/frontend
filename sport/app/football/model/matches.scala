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
  def compareMatches(x: FootballMatch, y: FootballMatch): Int
  implicit val ordering: Ordering[FootballMatch] = new Ordering[FootballMatch] {
    override def compare(x: FootballMatch, y: FootballMatch): Int = compareMatches(x, y)
  }

  def previousPage: Option[String]
  def nextPage: Option[String]

  // the subset of football matches to display
  lazy val relevantMatches: List[(FootballMatch, Competition)] = {
    val today = DateMidnight.now()
    for {
      competition <- competitions.competitions
      matches = competition
        .matches
        .filter(fMatch => filterMatches(fMatch, competition))
        .sorted
      days = matches.map(_.date.toDateMidnight).distinct
      dates = days.dropWhile(_ != today).take(daysToDisplay)
      fMatch <- matches
      if dates.contains(fMatch.date.toDateMidnight)
    } yield (fMatch, competition)
  }
}

trait Fixtures extends MatchesList {
  override val daysToDisplay = 3
  override def nextPage: Option[String] = Some("")
  override def previousPage: Option[String] = Some("")
  override def compareMatches(x: FootballMatch, y: FootballMatch): Int =
    Ordering[Long].compare(x.date.getMillis, y.date.getMillis)
}
trait Results extends MatchesList {
  override val daysToDisplay = 3
  override def nextPage: Option[String] = Some("")
  override def previousPage: Option[String] = Some("")
  override def compareMatches(x: FootballMatch, y: FootballMatch): Int =
    Ordering[Long].compare(y.date.getMillis, x.date.getMillis) // reversed
}
trait LiveMatches extends MatchesList {
  override val daysToDisplay = 1
  override def nextPage: Option[String] = None
  override def previousPage: Option[String] = None
  override def compareMatches(x: FootballMatch, y: FootballMatch): Int =
    Ordering[Long].compare(x.date.getMillis, y.date.getMillis)
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
