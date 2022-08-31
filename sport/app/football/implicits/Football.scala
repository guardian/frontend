package implicits

import football.model.FootballMatchTrail
import model._
import pa._
import views.MatchStatus

import java.time.temporal.ChronoUnit
import java.time.{LocalDate, ZonedDateTime}
import scala.language.implicitConversions

trait Football {

  implicit class MatchSeq2Sorted(matches: Seq[FootballMatch]) {
    lazy val sortByDate = matches.sortBy(m => (m.date.toInstant.toEpochMilli, m.homeTeam.name))
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

    lazy val statusSummary = StatusSummary(
      s"${m.homeTeam.name} v ${m.awayTeam.name}",
      MatchStatus(m.matchStatus).toString,
      m.homeTeam.score,
      m.awayTeam.score,
    )

    def isOn(date: LocalDate): Boolean =
      m.date.toLocalDate.isAfter(date) && m.date.toLocalDate.isBefore(date.plusDays(1))

    //results and fixtures do not actually have a status field in the API
    lazy val matchStatus = m match {
      case f: Fixture   => "Fixture"
      case l: LiveMatch => l.status
      case r: Result    => "FT"
      case m: MatchDay  => m.matchStatus
    }

    lazy val isFixture = m match {
      case f: Fixture  => true
      case m: MatchDay => m.matchStatus == "-" // yeah really even though its not in the docs
      case _           => false
    }

    lazy val isResult = m match {
      case r: Result   => true
      case m: MatchDay => m.result
      case _           => false
    }

    lazy val hasStarted = m.isLive || m.isResult

    val smartUrl: Option[String] = MatchUrl.smartUrl(m)

    def hasTeam(teamId: String): Boolean = m.homeTeam.id == teamId || m.awayTeam.id == teamId

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
      if (isGhostTeam) ghostTeamNameMappings.foldLeft(t.name) { case (name, (from, to)) => name.replace(from, to) }
      else t.name
    }

    // ghost team IDs correct for world-cups in 2014 and 2018, let's assume they are static and leave them here forever
    // PA knockout placeholder teams
    // e.g. "Winner Group A", "Wnr Gp G/R-Up Gp H", "Loser SF1"
    private val ghostTeamIds = List(
      "8158",
      "8159",
      "8162",
      "8163",
      "8160",
      "8161",
      "8164",
      "8165",
      "8166",
      "8167",
      "8172",
      "8173",
      "8170",
      "8171",
      "8174",
      "8175",
      "8204",
      "8206",
      "8200",
      "8202",
      "8205",
      "8207",
      "8201",
      "8203",
      "42624",
      "42625",
      "42626",
      "42627",
      "8176",
      "8177",
      "7357",
      "7358",
      // womens world cup 2019 (assumed the same for future women's world cups)
      // round of 16 (TODO)
      "64635",
      "64636",
      "64637",
      "64638",
      "64639",
      "64640",
      "64641",
      "64642", // quarter final
      "64643",
      "64644",
      "64645",
      "64646", //semi final
      "64647",
      "64648", // 3rd place playoff
      "64649",
      "64650", // final
    )

    private val ghostTeamNameMappings = List(
      "/" -> " / ",
      "Q / F" -> "QF",
      "Wnr Gp" -> "W",
      "R-Up Gp" -> "RU",
      "Winner Group" -> "Winner",
      "Runner-up Group" -> "Runner-up",
    )
  }

  // "700" is for world-cup 2014 - remove that entry when it is done (leave the impls for other tournaments)

  val roundLinks = Map[String, Round => Option[String]]()
  def groupTag(competitionId: String, round: Round): Option[String] = roundLinks.get(competitionId).flatMap(_(round))
}

object Football extends Football {

  def hoursTillMatch(theMatch: FootballMatch): Long = {
    ChronoUnit.HOURS.between(ZonedDateTime.now(), theMatch.date)
  }

}
