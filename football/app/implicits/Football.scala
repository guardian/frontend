package implicits

import pa._
import org.joda.time.{ DateTime, DateMidnight }
import pa.Result
import pa.LiveMatch
import pa.Fixture
import model.{ MatchUrl, Image, Trail, Content }

trait Football {

  implicit def content2minByMin(c: Content) = new {
    lazy val minByMin = c.tags.exists(_.id == "tone/minutebyminute")
  }

  implicit def content2matchReport(c: Content) = new {
    lazy val matchReport = c.tags.exists(_.id == "tone/matchreports")
  }

  implicit def content2squadSheet(c: Content) = new {
    lazy val squadSheet = c.tags.exists(_.id == "football/series/squad-sheets")
  }

  implicit def match2isOn(m: FootballMatch) = new {
    def isOn(date: DateMidnight) = m.date.isAfter(date) && m.date.isBefore(date.plusDays(1))
  }

  implicit def match2status(m: FootballMatch) = new {

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

  implicit def match2nations(m: FootballMatch) = new {
    // England, Scotland, Wales, N. Ireland or Rep. Ireland
    lazy val isHomeNationGame = {
      val homeNations = Seq("497", "630", "964", "494", "499")
      homeNations.contains(m.homeTeam.id) || homeNations.contains(m.awayTeam.id)
    }
  }

  implicit def match2hasTeam(m: FootballMatch) = new {
    def hasTeam(teamId: String) = m.homeTeam.id == teamId || m.awayTeam.id == teamId
  }

  implicit def match2trail(m: FootballMatch) = new Trail {

    private def text = if (m.isFixture) {
      m.homeTeam.name + " v " + m.awayTeam.name
    } else {
      "%s %s - %s %s".format(m.homeTeam.name, m.homeTeam.score.getOrElse(0), m.awayTeam.score.getOrElse(0), m.awayTeam.name)
    }

    def linkText: String = text
    def headline: String = text
    def trailText: Option[String] = text

    lazy val isLive: Boolean = m match {
      case matchDay: MatchDay => matchDay.liveMatch
      case _ => false
    }

    lazy val images: Seq[Image] = Nil
    lazy val url: String = MatchUrl(m)
    lazy val section: String = "football"
    lazy val videoImages: Seq[Image] = Nil
    lazy val webPublicationDate: DateTime = m.date
    lazy val sectionName: String = "Football"
  }

  implicit def match2hasStarted(m: FootballMatch) = new {
    lazy val hasStarted = m.isLive || m.isResult
  }
}

object Football extends Football

