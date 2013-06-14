package controllers.event

import common.Logging
import play.api.mvc._
import conf._
import controllers.{AuthAction, AuthLogging}
import play.api.libs.json.Json.toJson
import model.Event
import tools.Mongo.Events
import com.mongodb.casbah.Imports._

object EventController extends Controller with Logging with AuthLogging {

  def render() = AuthAction{ request =>
    val identity = request.session.get("identity").head
    Ok(views.html.events(identity, AdminConfiguration.environment.stage))
  }

  /* API */

  def find() = AuthAction { request =>
    val results = Events.find().sort(Map("startDate" -> 1)).toSeq.map(Event.fromDbObject)
    Ok(Event.toJsonList(results)).as("application/json")
  }

  def create() = AuthAction{ request =>
    request.body.asJson.map(_.toString).map(Event.fromJson).map { event =>
      Ok(Event.toJsonString(Event.mongo.createNew(event))).as("application/json")
    }.getOrElse(BadRequest(status("Invalid Json")).as("application/json"))
  }
  
  def read(eventId: String) = AuthAction{ request =>
    // eventId will have leading /
    Event.mongo.byId(eventId.drop(1)).map{ event =>   Ok(Event.toJsonString(event)) }
      .getOrElse(NotFound(status("no event found: " + eventId)).as("application/json"))
  }

  def update(eventId: String) = AuthAction{ request =>
    request.body.asJson.map(_.toString).map(Event.fromJson).map { event =>

      // eventId has a leading /
      val updateOk = Event.mongo.update(event, Some(eventId.drop(1)))
      if (updateOk) {
        Ok(Event.toJsonString(event)).as("application/json")
      } else {
        NotFound(status("no entity with id: " + eventId)).as("application/json")
      }
    }.getOrElse(BadRequest(status("Invalid Json")).as("application/json"))
  }

  def delete(eventId: String) = AuthAction{ request =>
    val deleteOk = Event.mongo.delete(eventId.drop(1))
    if (deleteOk) {
      Ok(status("deleted: " + eventId.drop(1))).as("application/json")
    } else {
      InternalServerError(status("error deleting document: " + eventId)).as("application/json")
    }
  }

  def status(msg: String) = toJson(Map("status" -> msg))
}
