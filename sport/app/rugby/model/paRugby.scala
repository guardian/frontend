package rugby.feed

import common.GuLogging
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
}

case class PAPlayer(
    id: Int,
    name: String,
)

case class NestedParticipant(
    id: Int,
    name: String,
    participants: Option[Seq[PAPlayer]],
)

case class Participant(
    id: Int,
    name: String,
)

case class PATeam(
    id: Int,
    participant: Participant,
    results: Map[String, PAResult],
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
      case "Not started"      => Status.Fixture
      case "Kick Off Delayed" => Status.Postponed
      case "1st half"         => Status.FirstHalf
      case "Halftime"         => Status.HalfTime
      case "2nd half"         => Status.SecondHalf
      case "Finished"         => Status.Result
      case "Extra time"       => Status.ExtraTimeFirstHalf // TODO not equivalent
      case "Finished AET"     => Status.Result
      case "Interrupted"      => Status.Postponed
      case "Abandoned"        => Status.Abandoned
      case "Postponed"        => Status.Postponed
      case _                  => Status.Fixture
    }
  }

  def toMatch(item: PAMatch): Match = {
    val homeTeam = item.entrants(0)
    val awayTeam = item.entrants(1)
    val stage = getStage(item)

    Match(
      date = item.date.toDateTimeISO,
      id = item.id.toString,
      homeTeam = rugby.model.Team(
        id = homeTeam.participant.id.toString,
        name = homeTeam.participant.name,
        score = homeTeam.results.get("running-score").map(_.value.toInt),
      ),
      awayTeam = rugby.model.Team(
        id = awayTeam.participant.id.toString,
        name = awayTeam.participant.name,
        score = awayTeam.results.get("running-score").map(_.value.toInt),
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
    items: List[PAMatch],
)

object PAMatchesResponse extends GuLogging {

  def fromJSON(json: String): Try[PAMatchesResponse] = {
    val jsvalue = Json.parse(json)
    val read = Json.fromJson[PAMatchesResponse](jsvalue)
    PAUtils.asTry(read)
  }
}

object PAUtils {
  def asTry[A](jsres: JsResult[A]): Try[A] =
    jsres match {
      case JsSuccess(events, _) => Success(events)
      case JsError(errors)      => Failure(JsonParseException(errors.toString))
    }
}
