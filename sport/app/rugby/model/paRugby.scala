package rugby.feed

import common.Logging
import org.joda.time.DateTime
import play.api.libs.json.{JsError, JsResult, JsSuccess, Json}
import rugby.model.Stage.Stage
import rugby.model._
import PAReads._

import scala.util.{Failure, Success, Try}

case class PAResult(
  code: String,
  name: String,
  value: String,
)

object PAReads {
  implicit val dtReads = play.api.libs.json.JodaReads.DefaultJodaDateTimeReads

  implicit val resultReads = Json.reads[PAResult]
  implicit val playerReads = Json.reads[PAPlayer]
  implicit val nestedParticipantReads = Json.reads[NestedParticipant]
  implicit val participantReads = Json.reads[Participant]
  implicit val teamReads = Json.reads[PATeam]
  implicit val venueReads = Json.reads[Venue]
  implicit val tournamentReads = Json.reads[Tournament]
  implicit val matchReads = Json.reads[PAMatch]
  implicit val matchesReads = Json.reads[PAMatchesResponse]
  implicit val tableRowReads = Json.reads[PATableRow]
  implicit val tableReads = Json.reads[PATableResponse]
  implicit val reads = Json.reads[PAEvent]
}

case class PAPlayer(
  id: Int,
  name: String,
)

case class NestedParticipant(
  id: Int,
  name: String,
  participants: Option[Seq[PAPlayer]]
)

case class Participant(
  id: Int,
  name: String,
)

case class PATeam(
  id: Int,
  participant: Participant,
  results: Map[String, PAResult]
)

case class Venue(
  name: String,
)

case class Tournament(
  name: String,
)


case class PAMatch(
  id: Int,
  date: DateTime,
  entrants: Seq[PATeam],
  venue: Option[Venue],
  tournament: Tournament,
  status: String,
)

object PAMatch {
  def getStage(item: PAMatch): Stage = {
    Stage.Group // TODO figure out how to get stage from PA data as not obvious
  }

  // See https://sport.pressassociation.io/docs/status
  def getStatus(item: PAMatch): Status = {
    item.status match {
      case "Not started" => Status.Fixture
      case "Kick Off Delayed" => Status.Postponed
      case "1st half" => Status.FirstHalf
      case "Halftime" => Status.HalfTime
      case "2nd half" => Status.SecondHalf
      case "Finished" => Status.Result
      case "Extra time" => Status.ExtraTimeFirstHalf // TODO not equivalent
      case "Finished AET" => Status.Result
      case "Interrupted" => Status.Postponed
      case "Abandoned" => Status.Abandoned
      case "Postponed" => Status.Postponed
      case _ => Status.Fixture
    }
  }

  def toMatch(item: PAMatch): Match = {
    val homeTeam = item.entrants(0)
    val awayTeam = item.entrants(1)
    val stage = getStage(item)

    Match(
      date = item.date,
      id = item.id.toString,
      homeTeam = rugby.model.Team(
        id = homeTeam.id.toString,
        name = homeTeam.participant.name,
        score = homeTeam.results.get("final-result").map(_.value.toInt)
      ),
      awayTeam = rugby.model.Team(
        id = awayTeam.id.toString,
        name = awayTeam.participant.name,
        score = awayTeam.results.get("final-result").map(_.value.toInt)
      ),
      venue = item.venue.map(_.name),
      competitionName = item.tournament.name,
      status = getStatus(item),
      event = WorldCup2019, // WARNING assumes we only have world cup 2019 info
      stage = getStage(item),
    )
  }
}

case class PAMatchesResponse(
  hasNext: Boolean,
  items: List[PAMatch]
)

object PAMatchesResponse extends Logging {

  def fromJSON(json: String): Try[PAMatchesResponse] = {
    val jsvalue = Json.parse(json)
    val read = Json.fromJson[PAMatchesResponse](jsvalue)
    PAUtils.asTry(read)
  }
}

case class PATableRow(
  rank: Int,
  participant: Participant,
  standings: Map[String, PAResult]
)

case class PATableResponse(
  tournament: Tournament,
  entries: List[PATableRow]
)

object PATableResponse extends Logging {

  // TODO put JSON elsewhere to re-use error behaviour etc.
  def fromJSON(json: String): Try[PATableResponse] = {
    val jsvalue = Json.parse(json)
    val res = Json.fromJson[PATableResponse](jsvalue)
    PAUtils.asTry(res)
  }

  def toGroupTable(table: PATableResponse): GroupTable = {
    val ranks = table.entries.map(entry => {
      TeamRank(
        id = entry.participant.id.toString,
        name = entry.participant.name,
        rank = entry.rank,
        played = entry.standings("played").value.toInt,
        won = entry.standings("wins").value.toInt,
        drawn = entry.standings("draws").value.toInt,
        lost = entry.standings("defeits").value.toInt,
        pointsdiff = 0, // TODO fixme or remove
        points = entry.standings("points").value.toInt,
      )
    })

    GroupTable(
      table.tournament.name,
      teams = ranks
    )
  }
}

case class PAEvent(
  id: Int,
  code: String,
  `type`: String,
  meta: Map[String, PAResult],
  elapsed: Int,
  participants: List[NestedParticipant],
)

object PAEvent extends Logging {

  def fromJSON(json: String): Try[PAEvent] = {
    val jsvalue = Json.parse(json)
    val event = Json.fromJson[PAEvent](jsvalue)
    PAUtils.asTry(event)
  }

  def fromJSONList(json: String): Try[List[PAEvent]] = {
    val jsvalue = Json.parse(json)
    val events = Json.fromJson[List[PAEvent]](jsvalue)
    PAUtils.asTry(events)
  }

  def toScoreEvent(event: PAEvent): Option[ScoreEvent] = {
    val scorers = event.participants.head.participants.headOption.flatMap(_.headOption)
    val team = event.participants.headOption

    // Filter to goal events with a team and scorer
    for {
      scorer <- scorers
      team <- team
      if event.code == "goal"
    } yield {
      val eventType = event.`type` match {
        case "Try" => ScoreType.`Try`
        case "Penalty Try" => ScoreType.PenaltyTry
        case "Penalty" => ScoreType.Penalty
        case "Conversion" => ScoreType.Conversion
        case "Dropkick" => ScoreType.DropGoal
        case _ =>
          log.info(s"Unexpected action type (${event.`type`}.")
          ScoreType.`Try`
      }

      ScoreEvent(
        player = Player(
          id = scorer.id.toString,
          name = scorer.name,
          team = Team(team.id.toString, team.name, None)
        ),
        minute = (event.elapsed / 60).toString, // TODO check
        `type` = eventType
      )
    }
  }
}

object PAUtils {
  def asTry[A](jsres: JsResult[A]): Try[A] = jsres match {
    case JsSuccess(events, _) => Success(events)
    case JsError(errors) => Failure(JsonParseException(errors.toString))
  }
}
