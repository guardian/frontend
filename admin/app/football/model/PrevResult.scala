package football.model

import pa.{MatchDayTeam, Result}

import java.time.ZonedDateTime

case class PrevResult(date: ZonedDateTime, self: MatchDayTeam, foe: MatchDayTeam, wasHome: Boolean) {

  val scores = self.score.flatMap { selfScore =>
    foe.score.map { foeScore =>
      (selfScore, foeScore)
    }
  }
  val hasResult = scores.isDefined

  val won = scores.exists { case (selfScore, foeScore) => selfScore > foeScore }
  val drew = scores.exists { case (selfScore, foeScore) => selfScore == foeScore }
  val lost = scores.exists { case (selfScore, foeScore) => selfScore < foeScore }
}

// TODO: check if this class is used anywhere
object PrevResult {
  def apply(result: Result, thisTeamId: String): PrevResult = {
    if (thisTeamId == result.homeTeam.id) PrevResult(result.date, result.homeTeam, result.awayTeam, wasHome = true)
    else PrevResult(result.date, result.awayTeam, result.homeTeam, wasHome = false)
  }
}
