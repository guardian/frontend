package football.model

import pa.{MatchDayTeam, Result}

import java.time.ZonedDateTime

case class PrevResult(date: ZonedDateTime, self: MatchDayTeam, foe: MatchDayTeam, wasHome: Boolean) {

  val scores: Option[(Int, Int)] = self.score.flatMap { selfScore =>
    foe.score.map { foeScore =>
      (selfScore, foeScore)
    }
  }
  val hasResult = scores.isDefined

  val won: Boolean = scores.exists { case (selfScore, foeScore) => selfScore > foeScore }
  val drew: Boolean = scores.exists { case (selfScore, foeScore) => selfScore == foeScore }
  val lost: Boolean = scores.exists { case (selfScore, foeScore) => selfScore < foeScore }
}

object PrevResult {
  def apply(result: Result, thisTeamId: String): PrevResult = {
    if (thisTeamId == result.homeTeam.id) PrevResult(result.date, result.homeTeam, result.awayTeam, wasHome = true)
    else PrevResult(result.date, result.awayTeam, result.homeTeam, wasHome = false)
  }
}
