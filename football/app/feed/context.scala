package feed

import pa._
import org.joda.time.DateMidnight
import pa.Result
import pa.MatchDay
import pa.Fixture

object `package` {

  implicit def match2rich(m: FootballMatch) = new {

    def isOn(date: DateMidnight) = m.date.isAfter(date) && m.date.isBefore(date.plusDays(1))

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

    lazy val isLive = m match {
      case matchDay: MatchDay => matchDay.liveMatch
      case _ => false
    }

    def hasTeam(teamId: String) = m.homeTeam.id == teamId || m.awayTeam.id == teamId
  }
}

