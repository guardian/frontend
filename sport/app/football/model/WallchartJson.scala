package football.model

import model.Competition
import play.api.libs.json.{Json, Writes}
import pa.{FootballMatch, LeagueStats, LeagueTableEntry, LeagueTeam, MatchDayTeam, Round, Stage, Venue}

case class WallchartJson(
    competition: Competition,
    competitionStages: List[CompetitionStageLike],
    next: Option[FootballMatch],
)

object WallchartJson {
  implicit val roundWrites: Writes[Round] = Json.writes[Round]
  implicit val stageWrites: Writes[Stage] = Json.writes[Stage]
  implicit val matchDayTeamWrites: Writes[MatchDayTeam] = Json.writes[MatchDayTeam]
  implicit val venueWrites: Writes[Venue] = Json.writes[Venue]
  implicit val footballWrites = new Writes[FootballMatch] {
    def writes(footballMatch: FootballMatch) =
      Json.obj(
        "id" -> footballMatch.id,
        "date" -> footballMatch.date,
        "stage" -> footballMatch.stage,
        "round" -> footballMatch.round,
        "leg" -> footballMatch.leg,
        "homeTeam" -> footballMatch.homeTeam,
        "awayTeam" -> footballMatch.awayTeam,
        "venue" -> footballMatch.venue,
        "comments" -> footballMatch.comments,
      )
  }

  implicit val competitionStageLikeWrites = new Writes[CompetitionStageLike] {
    def writes(competitionStageLike: CompetitionStageLike) =
      Json.obj(
        "matches" -> competitionStageLike.matches,
      )
  }
  implicit val leagueStatsWrites: Writes[LeagueStats] = Json.writes[LeagueStats]
  implicit val leagueTeamWrites: Writes[LeagueTeam] = Json.writes[LeagueTeam]
  implicit val leagueTableEntryWrites: Writes[LeagueTableEntry] = Json.writes[LeagueTableEntry]
  implicit val competitionWrites: Writes[Competition] = Json.writes[Competition]

  implicit val wallChartJsonWrites: Writes[WallchartJson] = Json.writes[WallchartJson]
}
