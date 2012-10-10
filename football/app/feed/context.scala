package feed

import pa.{ MatchDay, Result, Fixture, FootballMatch }

object `package` {

  implicit def match2rich(m: FootballMatch) = new {

    lazy val isFixture = m match {
      case f: Fixture => true
      case _ => false
    }

    lazy val isResult = m match {
      case r: Result => true
      case _ => false
    }

    lazy val isLive = m match {
      case matchDay: MatchDay => matchDay.liveMatch
      case _ => false
    }
  }
}

