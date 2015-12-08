package implicits

import football.model.FootballMatchTrail
import model._
import org.joda.time.LocalDate
import pa._
import views.MatchStatus
import scala.language.implicitConversions

trait Football extends Collections {

  implicit class MatchSeq2Sorted(matches: Seq[FootballMatch]) {
    lazy val sortByDate = matches.sortBy(m => (m.date.getMillis, m.homeTeam.name))
  }

  implicit class Content2minByMin(c: ContentType) {
    lazy val minByMin = c.tags.tags.exists(_.id == "tone/minutebyminute")
  }

  implicit class Content2matchReport(c: ContentType) {
    lazy val matchReport = c.tags.tags.exists(_.id == "tone/matchreports")
  }

  implicit class Content2squadSheet(c: ContentType) {
    lazy val squadSheet = c.tags.tags.exists(_.id == "football/series/squad-sheets")
  }

  implicit class Content2preview(c: ContentType) {
    lazy val preview = c.tags.tags.exists(_.id == "football/series/match-previews")
  }

  implicit def match2Trail(m: FootballMatch): FootballMatchTrail = {
    FootballMatchTrail.toTrail(m)
  }

  implicit class MatchHelpers(m: FootballMatch) {

    lazy val statusSummary = StatusSummary(s"${m.homeTeam.name} v ${m.awayTeam.name}",
      MatchStatus(m.matchStatus).toString, m.homeTeam.score, m.awayTeam.score)

    def isOn(date: LocalDate) = m.date.isAfter(date) && m.date.isBefore(date.plusDays(1))

    //results and fixtures do not actually have a status field in the API
    lazy val matchStatus = m match {
      case f: Fixture => "Fixture"
      case l: LiveMatch => l.status
      case r: Result => "FT"
      case m: MatchDay => m.matchStatus
    }

    lazy val isFixture = m match {
      case f: Fixture => true
      case m: MatchDay => m.matchStatus == "-" // yeah really even though its not in the docs
      case _ => false
    }

    lazy val isResult = m match {
      case r: Result => true
      case m: MatchDay => m.result
      case _ => false
    }

    lazy val hasStarted = m.isLive || m.isResult

    val smartUrl: String = MatchUrl.smartUrl(m)

    def hasTeam(teamId: String) = m.homeTeam.id == teamId || m.awayTeam.id == teamId

    // England, Scotland, Wales, N. Ireland or Rep. Ireland
    lazy val isHomeNationGame = {
      val homeNations = Seq("497", "630", "964", "494", "499")
      homeNations.contains(m.homeTeam.id) || homeNations.contains(m.awayTeam.id)
    }
  }

  implicit class TeamHasScored(t: MatchDayTeam) {
    lazy val hasScored = t.score.exists(_ != 0)
  }

  implicit class GhostTeam(t: MatchDayTeam) {
    lazy val isGhostTeam = ghostTeamIds.contains(t.id)

    lazy val knockoutName = {
      if (isGhostTeam) ghostTeamNameMappings.foldLeft(t.name){ case (name, (from, to)) => name.replace(from, to)}
      else t.name
    }

    // ghost team IDs correct for world-cup 2014, should go after that
    // PA knockout placeholder teams
    // e.g. "Winner Group A", "Wnr Gp G/R-Up Gp H", "Loser SF1"
    private val ghostTeamIds = List()

    private val ghostTeamNameMappings = List(
      "/" -> " / ",
      "Q / F" -> "QF",
      "Wnr Gp" -> "W",
      "R-Up Gp" -> "RU",
      "Winner Group" -> "Winner",
      "Runner-up Group" -> "Runner-up"
    )
  }

 // "700" is for world-cup 2014 - remove that entry when it is done (leave the impls for other tournaments)

  val roundLinks = Map[String, Round => Option[String]]()
  def groupTag(competitionId: String, round: Round) = roundLinks.get(competitionId).flatMap(_(round))
}

object Football extends Football

