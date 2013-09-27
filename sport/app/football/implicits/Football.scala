package implicits

import pa._
import org.joda.time.{ DateTime, DateMidnight }
import model._

trait Football {

  implicit class Content2minByMin(c: Content) {
    lazy val minByMin = c.tags.exists(_.id == "tone/minutebyminute")
  }

  implicit class Content2matchReport(c: Content) {
    lazy val matchReport = c.tags.exists(_.id == "tone/matchreports")
  }

  implicit class Content2squadSheet(c: Content) {
    lazy val squadSheet = c.tags.exists(_.id == "football/series/squad-sheets")
  }

  implicit class Match2isOn(m: FootballMatch) {
    def isOn(date: DateMidnight) = m.date.isAfter(date) && m.date.isBefore(date.plusDays(1))
  }

  implicit class Match2status(m: FootballMatch) {

    //results and fixtures do not actually have a status field in the API
    lazy val matchStatus = m match {
      case f: Fixture => "Fixture"
      case l: LiveMatch => l.status
      case r: Result => "FT"
      case m: MatchDay => m.matchStatus
    }

    lazy val isFixture = m match {
      case f: Fixture => true
      case _ => false
    }

    lazy val isResult = m match {
      case r: Result => true
      case m: MatchDay => m.result
      case _ => false
    }
  }

  implicit class Match2nations(m: FootballMatch) {
    // England, Scotland, Wales, N. Ireland or Rep. Ireland
    lazy val isHomeNationGame = {
      val homeNations = Seq("497", "630", "964", "494", "499")
      homeNations.contains(m.homeTeam.id) || homeNations.contains(m.awayTeam.id)
    }
  }

  implicit class Match2hasTeam(m: FootballMatch) {
    def hasTeam(teamId: String) = m.homeTeam.id == teamId || m.awayTeam.id == teamId
  }

  implicit class Match2trail(m: FootballMatch) extends Trail {

    private def text = if (m.isFixture) {
      s"${m.homeTeam.name} v ${m.awayTeam.name}"
    } else {
      val homeScore = m.homeTeam.score.getOrElse(0)
      val awayScore = m.awayTeam.score.getOrElse(0)
      s"${m.homeTeam.name} $homeScore - $awayScore ${m.awayTeam.name}"
    }

    override def linkText: String = text
    override def headline: String = text
    override def trailText: Option[String] = text

    override lazy val isLive: Boolean = m match {
      case matchDay: MatchDay => matchDay.liveMatch
      case _ => false
    }

    override lazy val images: List[ImageElement] = Nil
    override lazy val videos: List[VideoElement] = Nil
    override lazy val thumbnail: Option[ImageElement] = None
    override lazy val mainPicture: Option[ImageAsset] = None
    override lazy val url: String = MatchUrl(m)
    override lazy val section: String = "football"
    override lazy val webPublicationDate: DateTime = m.date
    override lazy val sectionName: String = "Football"
  }

  implicit class Match2hasStarted(m: FootballMatch) {
    lazy val hasStarted = m.isLive || m.isResult
  }

  implicit class TeamHasScored(t: MatchDayTeam) {
    lazy val hasScored = t.score.exists(_ != 0)
  }
}

object Football extends Football

