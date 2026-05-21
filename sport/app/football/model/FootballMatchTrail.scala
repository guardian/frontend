package football.model

import model._
import pa.{MatchDay, FootballMatch}

case class FootballMatchTrail(
    isLive: Boolean,
    url: String,
)

object FootballMatchTrail {

  def toTrail(m: FootballMatch): FootballMatchTrail = {
    FootballMatchTrail(
      isLive = m match {
        case matchDay: MatchDay => matchDay.liveMatch
        case _                  => false
      },
      url = MatchUrl(m),
    )
  }

  def toTrail(c: ContentType): FootballMatchTrail = {
    FootballMatchTrail(
      isLive = c.fields.isLive,
      url = c.metadata.url,
    )
  }
}
