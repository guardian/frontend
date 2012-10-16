package feed

import pa.{ MatchDay, Result, Fixture, FootballMatch }
import org.joda.time.DateMidnight

object `package` {

  implicit def match2rich(m: FootballMatch) = new {

    def isOn(date: DateMidnight) = m.date.isAfter(date) && m.date.isBefore(date.plusDays(1))

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
  }
}

