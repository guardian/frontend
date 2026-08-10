package football.model

import cricketModel.{Innings, InningsWicket, Match, Team}
import model.dotcomrendering.DotcomRenderingUtils.withoutNull
import play.api.libs.json.{JsObject, JsValue, Json}

object CricketScoreBoardDataModel {
  private def getTeam(team: Team) = {
    Json.obj(
      "name" -> team.name,
      "home" -> team.home,
    )
  }

  private def getFallOfWicket(inningsWicket: InningsWicket) = {
    Json.obj(
      "order" -> inningsWicket.order,
    )
  }

  private def getInnings(innings: Innings) = {
    Json.obj(
      "order" -> innings.order,
      "battingTeam" -> innings.battingTeam,
      "runsScored" -> innings.runsScored,
      "declared" -> innings.declared,
      "forfeited" -> innings.forfeited,
      "fallOfWicket" -> innings.fallOfWicket.map(getFallOfWicket),
      "overs" -> innings.overs,
    )
  }

  def getMatch(theMatch: Match): JsObject = {
    Json.obj(
      "matchId" -> theMatch.matchId,
      "competitionName" -> theMatch.competitionName,
      "stage" -> theMatch.stage,
      "venueName" -> theMatch.venueName,
      "teams" -> theMatch.teams.map(getTeam),
      "innings" -> theMatch.innings.map(getInnings),
      "gameDate" -> theMatch.gameDate,
    )
  }

  def toJson(theMatch: Match): JsValue = {
    val jsValue = Json.toJson(getMatch(theMatch))
    withoutNull(jsValue)
  }
}
