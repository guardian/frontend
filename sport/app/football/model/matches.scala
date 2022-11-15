package football.model

import com.madgag.scala.collection.decorators.MapDecorator
import common.Edition
import football.collections.RichList
import football.datetime.DateHelpers
import implicits.Football
import model.Competition
import pa.{FootballMatch, Round}
import play.api.mvc.RequestHeader

import java.time.format.DateTimeFormatter
import java.time.{LocalDate, ZonedDateTime}

trait MatchesList extends Football with RichList {

  val competitions: Seq[Competition]

  val baseUrl: String
  val pageType: String

  val date: LocalDate
  val daysToDisplay: Int

  lazy val isEmpty = allRelevantMatches.isEmpty

  def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean

  // ordering for the displayed matches
  def timeComesFirstInList(d: ZonedDateTime, other: ZonedDateTime): Boolean
  def dateComesFirstInList(d: LocalDate, other: LocalDate): Boolean =
    timeComesFirstInList(
      d.atStartOfDay(DateHelpers.defaultFootballZoneId),
      other.atStartOfDay(DateHelpers.defaultFootballZoneId),
    )

  private lazy val allRelevantMatches: List[(FootballMatch, Competition)] = {
    val matchesWithCompetition = for {
      competition <- competitions
      matches =
        competition.matches
          .filter(fMatch => filterMatches(fMatch, competition))
      fMatch <- matches
    } yield (fMatch, competition)
    matchesWithCompetition.sortWith {
      case ((fMatch1, _), (fMatch2, _)) => timeComesFirstInList(fMatch1.date, fMatch2.date)
    }
  }
  lazy val matchDates = allRelevantMatches.map { case (fMatch, _) => fMatch.date.toLocalDate }.distinct
  // the subset of football matches to display for the given date
  lazy val relevantMatches: List[(FootballMatch, Competition)] = {
    val startDate = date
    val matchDates = allRelevantMatches.map { case (fMatch, _) => fMatch.date.toLocalDate }.distinct
    val eligibleDates = matchDates.dropWhile(dateComesFirstInList(_, startDate)).take(daysToDisplay)
    allRelevantMatches.filter {
      case (fMatch, _) =>
        eligibleDates.contains(fMatch.date.toLocalDate)
    }
  }
  def matchesGroupedByDate(implicit request: RequestHeader) = {
    relevantMatches.segmentBy(key = _._1.date.withZoneSameInstant(Edition(request).timezoneId))
  }
  def matchesGroupedByDateAndCompetition(implicit
      request: RequestHeader,
  ): Seq[(ZonedDateTime, List[(Competition, List[FootballMatch])])] =
    matchesGroupedByDate.map {
      case (d, ms) =>
        val competitionsWithMatches = ms
          .groupBy(_._2)
          .mapV(_.map {
            case (matches, _) => matches
          })
          .toList
          .sortWith {
            case ((comp1, matches1), (comp2, matches2)) =>
              val competitionOrder = competitions.map(_.id).toList
              competitionOrder.indexOfOpt(comp1.id).getOrElse(competitionOrder.size) < competitionOrder
                .indexOfOpt(comp2.id)
                .getOrElse(competitionOrder.size)
          }
        (d, competitionsWithMatches)
    }

  lazy val nextPage: Option[String] = {
    val nextMatchDate = matchDates.dropWhile(dateComesFirstInList(_, date)).drop(daysToDisplay).headOption
    nextMatchDate.map(s"$baseUrl/more/" + _.format(DateTimeFormatter.ofPattern("yyyy/MMM/dd")))
  }
  lazy val previousPage: Option[String] = {
    val nextMatchDate = matchDates.takeWhile(dateComesFirstInList(_, date)).lastOption
    nextMatchDate.map(s"$baseUrl/" + _.format(DateTimeFormatter.ofPattern("yyyy/MMM/dd")))
  }

  def getPageTitle: String = {
    pageType match {
      case "live"     => "Live football scores"
      case "matches"  => "Football scores"
      case "fixtures" => "Football fixtures"
      case "results"  => "Football results"
      case _          => pageType
    }
  }
}

trait Fixtures extends MatchesList {
  override val baseUrl: String = "/football/fixtures"

  override val pageType = "fixtures"
  // ordering for the displayed matches
  override def timeComesFirstInList(d: ZonedDateTime, other: ZonedDateTime): Boolean = d.isBefore(other)
}
trait Results extends MatchesList {
  override val baseUrl: String = "/football/results"
  override val pageType = "results"
  override def timeComesFirstInList(d: ZonedDateTime, other: ZonedDateTime): Boolean = d.isAfter(other)
}
trait MatchDays extends MatchesList {
  override val baseUrl: String = "/football/live"
  override val pageType = if (LocalDate.now == date) "live" else "matches"
  override val daysToDisplay = 1
  override lazy val nextPage: Option[String] = None
  override lazy val previousPage: Option[String] = None
  override def timeComesFirstInList(d: ZonedDateTime, other: ZonedDateTime): Boolean = d.isBefore(other)
}
trait TeamList { val teamId: String }
trait CompetitionList {
  val competitions: Seq[Competition]
  val competitionId: String
  lazy val competition = competitions.find(_.id == competitionId)
}

case class FixturesList(date: LocalDate, competitions: Seq[Competition]) extends Fixtures {
  override val daysToDisplay = 3
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isFixture
}
case class CompetitionFixturesList(
    date: LocalDate,
    competitions: Seq[Competition],
    competitionId: String,
    competitionTag: String,
) extends Fixtures
    with CompetitionList {
  override val daysToDisplay = 20
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    competition.id == competitionId && fMatch.isFixture
  override val baseUrl: String = s"/football/$competitionTag/fixtures"
}

case class TeamFixturesList(
    date: LocalDate,
    competitions: Seq[Competition],
    teamId: String,
    teamTag: String,
    daysToDisplay: Int = 20,
) extends Fixtures
    with TeamList {
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isFixture && fMatch.hasTeam(teamId)

  override val baseUrl: String = s"/football/$teamTag/fixtures"
}

case class ResultsList(date: LocalDate, competitions: Seq[Competition]) extends Results {
  override val daysToDisplay = 3
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isResult
}
case class CompetitionResultsList(date: LocalDate, competitions: Seq[Competition], competitionId: String)
    extends Results
    with CompetitionList {
  override val baseUrl: String = competition.fold("/football/results")(_.url + "/results")
  override val daysToDisplay = 20
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    competition.id == competitionId && fMatch.isResult
}

case class TeamResultsList(
    date: LocalDate,
    competitions: Seq[Competition],
    teamId: String,
    teamUrl: Option[String] = None,
) extends Results
    with TeamList {
  override val baseUrl: String = teamUrl.fold("/football/results")(url => s"$url/results")
  override val daysToDisplay = 20
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.isResult && fMatch.hasTeam(teamId)
}

case class MatchDayList(competitions: Seq[Competition], date: LocalDate) extends MatchDays {
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.date.toLocalDate == date
}
case class CompetitionMatchDayList(competitions: Seq[Competition], competitionId: String, date: LocalDate)
    extends MatchDays
    with CompetitionList {
  override def filterMatches(fMatch: FootballMatch, competition: Competition): Boolean =
    fMatch.date.toLocalDate == date && competition.id == competitionId
}
case class CompetitionRoundMatchesList(competitions: Seq[Competition], competition: Competition, round: Round)
    extends MatchDays {
  override val daysToDisplay = 1000
  override lazy val date = competition.startDate.getOrElse(LocalDate.now)
  override def filterMatches(fMatch: FootballMatch, matchCompetition: Competition): Boolean =
    competition.id == matchCompetition.id && fMatch.round == round
}
