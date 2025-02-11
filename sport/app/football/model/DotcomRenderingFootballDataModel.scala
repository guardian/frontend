package football.model

import model.dotcomrendering.DotcomRenderingUtils.withoutNull
import model.{Competition, CompetitionSummary}
import pa.{
  Fixture,
  FootballMatch,
  LeagueStats,
  LeagueTableEntry,
  LeagueTeam,
  LiveMatch,
  MatchDay,
  MatchDayTeam,
  Official,
  Result,
  Round,
  Stage,
  Venue,
  Competition => PaCompetition,
}
import play.api.libs.json._

import java.time.LocalDate
import java.time.format.DateTimeFormatter

case class CompetitionMatches(competitionSummary: CompetitionSummary, matches: List[FootballMatch])
case class MatchesByDateAndCompetition(date: LocalDate, competitionMatches: List[CompetitionMatches])

case class DotcomRenderingFootballDataModel(
    matchesList: Seq[MatchesByDateAndCompetition],
    nextPage: Option[String],
    previousPage: Option[String],
)

object DotcomRenderingFootballDataModel {
  def getMatchesList(
      matches: Seq[(LocalDate, List[(Competition, List[FootballMatch])])],
  ): Seq[MatchesByDateAndCompetition] = {
    matches.map { case (date, competitionMatches) =>
      MatchesByDateAndCompetition(
        date = date,
        competitionMatches = competitionMatches.map { case (competition, matches) =>
          CompetitionMatches(
            competitionSummary = competition,
            matches = matches,
          )
        },
      )
    }
  }
}

object DotcomRenderingFootballDataModelImplicits {
  implicit val localDateWrites: Writes[LocalDate] = Writes[LocalDate] { date =>
    JsString(date.format(DateTimeFormatter.ISO_LOCAL_DATE))
  }

  implicit val stageFormat: Writes[Stage] = Json.writes[Stage]
  implicit val roundFormat: Writes[Round] = Json.writes[Round]
  implicit val matchDayTeamFormat: Writes[MatchDayTeam] = Json.writes[MatchDayTeam]
  implicit val venueFormat: Writes[Venue] = Json.writes[Venue]
  implicit val paCompetitionFormat: Writes[PaCompetition] = Json.writes[PaCompetition]
  implicit val officialFormat: Writes[Official] = Json.writes[Official]

  // Writes for Fixture with a type discriminator
  implicit val fixtureWrites: Writes[Fixture] = Writes { fixture =>
    Json.writes[Fixture].writes(fixture).as[JsObject] + ("type" -> JsString("Fixture"))
  }

  // Writes for MatchDay with a type discriminator
  implicit val matchDayWrites: Writes[MatchDay] = Writes { matchDay =>
    Json.writes[MatchDay].writes(matchDay).as[JsObject] + ("type" -> JsString("MatchDay"))
  }

  // Writes for Result with a type discriminator
  implicit val resultWrites: Writes[Result] = Writes { result =>
    Json.writes[Result].writes(result).as[JsObject] + ("type" -> JsString("Result"))
  }

  // Writes for LiveMatch with a type discriminator
  implicit val liveMatchWrites: Writes[LiveMatch] = Writes { liveMatch =>
    Json.writes[LiveMatch].writes(liveMatch).as[JsObject] + ("type" -> JsString("LiveMatch"))
  }

  implicit val footballMatchWrites: Writes[FootballMatch] = Writes { matchInstance =>
    matchInstance match {
      case f: Fixture   => Json.toJson(f)(fixtureWrites)
      case m: MatchDay  => Json.toJson(m)(matchDayWrites)
      case r: Result    => Json.toJson(r)(resultWrites)
      case l: LiveMatch => Json.toJson(l)(liveMatchWrites)
    }
  }

  implicit val leagueStatsWrites: Writes[LeagueStats] = Json.writes[LeagueStats]
  implicit val leagueTeamWrites: Writes[LeagueTeam] = Json.writes[LeagueTeam]
  implicit val leagueTableEntryWrites: Writes[LeagueTableEntry] = Json.writes[LeagueTableEntry]

  implicit val competitionFormat: Writes[CompetitionSummary] = (competition: CompetitionSummary) =>
    Json.obj(
      "id" -> competition.id,
      "url" -> competition.url,
      "fullName" -> competition.fullName,
      "nation" -> competition.nation,
    )
  implicit val competitionMatchesFormat: Writes[CompetitionMatches] = Json.writes[CompetitionMatches]
  implicit val dateCompetitionMatchesFormat: Writes[MatchesByDateAndCompetition] =
    Json.writes[MatchesByDateAndCompetition]

  implicit val SportsFormat: Writes[DotcomRenderingFootballDataModel] = Json.writes[DotcomRenderingFootballDataModel]
}
