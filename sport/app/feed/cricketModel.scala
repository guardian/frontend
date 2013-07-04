package cricketModel

import cricketOpta._

class Match(
    private val matchSummary: CricketMatchSummary )
{
  lazy val homeTeam = matchSummary.teams.filter(_.homeOrAway == "home").head
  lazy val awayTeam = matchSummary.teams.filter(_.homeOrAway == "away").head

  lazy val competitionName = matchSummary.matchDetail.competitionName
  lazy val description = matchSummary.matchDetail.description
  lazy val venueName = matchSummary.matchDetail.venueName
  lazy val result = matchSummary.matchDetail.result
  lazy val gameDate = matchSummary.matchDetail.gameDate

  lazy val homeTeamInnings = matchSummary.innings.filter(x => x.battingTeamId == homeTeam.id).sortBy(_.id)
  lazy val awayTeamInnings = matchSummary.innings.filter(x => x.battingTeamId == awayTeam.id).sortBy(_.id)
}

abstract class Innings {
  def id: Int
  def battingTeamId: Int
  def runsScored: Int
  def overs: String
  def wickets: Int
  def declared: Boolean
  def forfeited: Boolean

  lazy val closed = declared || forfeited || allOut
  lazy val allOut = wickets == 10
}