package football.model

import model._
import implicits.Football._
import pa.{MatchDay, FootballMatch}

case class FootballMatchTrail(
  isLive: Boolean,
  url: String
)

object FootballMatchTrail {

  private def matchText(m: FootballMatch) = if (m.isFixture) {
      s"${m.homeTeam.name} v ${m.awayTeam.name}"
    } else {
      val homeScore = m.homeTeam.score.getOrElse(0)
      val awayScore = m.awayTeam.score.getOrElse(0)
      s"${m.homeTeam.name} $homeScore - $awayScore ${m.awayTeam.name}"
    }

  def toTrail(m: FootballMatch): FootballMatchTrail = {
    val text = matchText(m)

    FootballMatchTrail(
      isLive = m match {
        case matchDay: MatchDay => matchDay.liveMatch
        case _ => false
      },
      url = MatchUrl(m)
    )
  }

  def toTrail(c: ContentType): FootballMatchTrail = {
    FootballMatchTrail(
      isLive = c.fields.isLive,
      url = c.metadata.url
    )
  }
}